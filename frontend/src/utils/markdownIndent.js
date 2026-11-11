/**
 * 마크다운 들여쓰기와 목록 이어쓰기.
 *
 * 🛑 **에디터에 Tab 처리가 아예 없었다** (2026-11-11). `grep -rn Tab src` 가
 *    0건이었다. 그래서 `- ` 뒤에 Tab 을 누르면 들여쓰기가 되는 대신 textarea
 *    에서 **초점이 빠져나가** 다음 단추로 갔다. 브라우저 기본 동작이다.
 *
 * 여기 있는 것은 전부 **순수 함수**다. DOM 도 React 도 보지 않고, 글자와
 * 커서 자리를 받아 바뀐 글자와 커서 자리를 돌려준다. 그래야 브라우저 없이
 * 잴 수 있다 (`node` 로 바로 돌아간다).
 */

/**
 * 한 단계 들여쓰기 폭.
 *
 * 🛑 2칸이다. CommonMark 에서 `- ` 다음 단계 목록은 **부모의 내용 칸**까지
 *    들여써야 한다. `- ` 는 표식 1칸 + 공백 1칸이라 2칸이다. 4칸을 쓰면
 *    파서가 코드블록으로 읽는 자리가 생긴다.
 */
export const INDENT = "  ";

/** 목록 줄인가. `- `, `* `, `+ `, `1. `, `1) ` 와 그 앞 공백을 가른다. */
const LIST_RE = /^(\s*)([-*+]|\d+[.)])(\s+)(\[[ xX]\]\s+)?/;

/** 선택이 걸친 줄들의 시작 인덱스와 끝 인덱스. */
function touchedLines(value, selStart, selEnd) {
  const from = value.lastIndexOf("\n", selStart - 1) + 1;
  let to = value.indexOf("\n", selEnd);
  if (to === -1) to = value.length;
  // 🛑 선택이 줄바꿈 **직후**에서 끝나면 그 다음 줄은 건드리지 않는다.
  //    안 가리면 아래로 끌어 고를 때마다 한 줄이 더 들여써진다.
  if (selEnd > selStart && selEnd === from) {
    return { from, to: from };
  }
  return { from, to };
}

/**
 * Tab. 목록이면 줄 전체를 한 단계 내리고, 아니면 공백을 끼운다.
 * 여러 줄을 고르면 고른 줄 전부를 내린다.
 */
export function indentSelection(value, selStart, selEnd) {
  const multi =
    selStart !== selEnd || false;
  const { from, to } = touchedLines(value, selStart, selEnd);
  const block = value.slice(from, to);

  if (selStart !== selEnd && block.includes("\n")) {
    const lines = block.split("\n");
    const next = lines.map((l) => (l.length ? INDENT + l : l)).join("\n");
    const added = next.length - block.length;
    return {
      value: value.slice(0, from) + next + value.slice(to),
      // 고른 범위를 그대로 유지한다. 안 그러면 Tab 을 두 번 못 누른다
      selectionStart: from,
      selectionEnd: to + added,
    };
  }

  const line = value.slice(from, to);
  if (LIST_RE.test(line)) {
    // 목록 줄은 **커서가 어디 있든** 줄 전체를 내린다
    return {
      value: value.slice(0, from) + INDENT + value.slice(from),
      selectionStart: selStart + INDENT.length,
      selectionEnd: selEnd + INDENT.length,
    };
  }

  // 목록이 아니면 커서 자리에 공백을 끼운다 (고른 글자는 바꿔치기)
  return {
    value: value.slice(0, selStart) + INDENT + value.slice(selEnd),
    selectionStart: selStart + INDENT.length,
    selectionEnd: selStart + INDENT.length,
  };
}

/** Shift+Tab. 한 단계 올린다. 올릴 것이 없으면 그대로 둔다. */
export function outdentSelection(value, selStart, selEnd) {
  const { from, to } = touchedLines(value, selStart, selEnd);
  const block = value.slice(from, to);
  const lines = block.split("\n");

  let firstCut = 0;
  let totalCut = 0;
  const next = lines.map((l, i) => {
    // 탭 하나 또는 공백 최대 INDENT 칸을 뗀다
    let cut = 0;
    if (l.startsWith("\t")) cut = 1;
    else {
      while (cut < INDENT.length && l[cut] === " ") cut += 1;
    }
    if (i === 0) firstCut = cut;
    totalCut += cut;
    return l.slice(cut);
  });

  if (totalCut === 0) {
    return { value, selectionStart: selStart, selectionEnd: selEnd };
  }

  const joined = next.join("\n");
  const multi = selStart !== selEnd && block.includes("\n");
  return {
    value: value.slice(0, from) + joined + value.slice(to),
    // 🛑 첫 줄에서 떼어 낸 만큼만 커서를 당긴다. 줄 시작보다 왼쪽으로
    //    가지 않게 막는다 (안 막으면 앞 줄로 넘어간다)
    selectionStart: multi ? from : Math.max(from, selStart - firstCut),
    selectionEnd: multi
      ? to - totalCut
      : Math.max(from, selEnd - firstCut),
  };
}

/**
 * Enter. 목록 줄에서 다음 항목을 만들어 준다.
 *
 * 돌려주는 것이 `null` 이면 평소 Enter 로 둔다(이 함수가 끼어들지 않는다).
 *
 * 🛑 **들여쓰기를 물려받는다.** 전 판은 `- ` 하나만 보고 들여쓰기를 버려서,
 *    중첩 목록에서 Enter 를 치면 맨 왼쪽으로 튀어나왔다.
 * 🛑 번호 목록은 **번호를 올린다.** `1.` 다음은 `2.` 다.
 * 🛑 내용이 빈 항목에서 Enter 를 치면 **목록을 끝낸다.** 빈 `- ` 를 남기면
 *    미리보기에 빈 동그라미가 찍힌다.
 */
export function continueList(value, selStart) {
  const from = value.lastIndexOf("\n", selStart - 1) + 1;
  const line = value.slice(from, selStart);
  const m = line.match(LIST_RE);
  if (!m) return null;

  const [marker] = m;
  const [, pad, bullet, gap, task] = m;
  const rest = line.slice(marker.length);

  if (rest.trim() === "") {
    // 빈 항목 -> 목록을 끝낸다 (그 줄의 표식을 지운다)
    const head = value.slice(0, from);
    const tail = value.slice(selStart);
    return {
      value: head + tail,
      selectionStart: from,
      selectionEnd: from,
      ended: true,
    };
  }

  let nextBullet = bullet;
  const num = bullet.match(/^(\d+)([.)])$/);
  if (num) nextBullet = `${parseInt(num[1], 10) + 1}${num[2]}`;

  // 체크박스는 항상 빈 칸으로 시작한다 (끝낸 것을 물려받지 않는다)
  const nextTask = task ? task.replace(/\[[ xX]\]/, "[ ]") : "";
  const insert = `\n${pad}${nextBullet}${gap}${nextTask}`;
  return {
    value: value.slice(0, selStart) + insert + value.slice(selStart),
    selectionStart: selStart + insert.length,
    selectionEnd: selStart + insert.length,
    ended: false,
  };
}
