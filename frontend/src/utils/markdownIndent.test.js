import { describe, test, expect } from "vitest";
import {
  INDENT,
  indentSelection,
  outdentSelection,
  continueList,
} from "./markdownIndent";

/**
 * 🛑 커서 자리를 "a[bc]d" 꼴 표시로 적지 않는다. 처음에 그렇게 썼다가
 *    **체크박스 `- [x]` 가 선택 표시로 파싱됐다.** 글자가 데이터인 검사에
 *    표시 문법을 섞으면 그 문법이 데이터와 겹치는 날이 온다. 인덱스를 직접 준다.
 */
const r = (value, selectionStart, selectionEnd = selectionStart) => ({
  value,
  selectionStart,
  selectionEnd,
});

describe("INDENT", () => {
  // CommonMark 에서 `- ` 다음 단계는 부모의 내용 칸(2칸)까지 들여써야 한다.
  // 4칸을 쓰면 파서가 코드블록으로 읽는 자리가 생긴다.
  test("두 칸이다", () => expect(INDENT).toBe("  "));
});

describe("Tab - 목록 줄은 줄 전체를 내린다", () => {
  test.each([
    ["- 뒤 커서", "- ", 2, "  - ", 4],
    ["- fo|o 가운데", "- foo", 4, "  - foo", 6],
    ["* 목록", "* bar", 5, "  * bar", 7],
    ["+ 목록", "+ bar", 5, "  + bar", 7],
    ["1. 목록", "1. bar", 6, "  1. bar", 8],
    ["1) 목록", "1) bar", 6, "  1) bar", 8],
    ["체크박스", "- [ ] todo", 10, "  - [ ] todo", 12],
    ["끝낸 체크박스", "- [x] todo", 10, "  - [x] todo", 12],
    ["이미 들여쓴 목록", "  - a", 5, "    - a", 7],
    ["앞 줄이 있어도 그 줄만", "# h\n- a", 7, "# h\n  - a", 9],
  ])("%s", (_label, value, at, want, wantAt) => {
    expect(indentSelection(value, at, at)).toEqual(r(want, wantAt));
  });
});

describe("Tab - 목록이 아니면 공백을 끼운다", () => {
  test("빈 줄", () => expect(indentSelection("", 0, 0)).toEqual(r("  ", 2)));
  test("글 가운데", () =>
    expect(indentSelection("abcd", 2, 2)).toEqual(r("ab  cd", 4)));
  test("제목 줄", () =>
    expect(indentSelection("# h", 3, 3)).toEqual(r("# h  ", 5)));
});

describe("Tab - 여러 줄 선택", () => {
  test("두 줄 전부", () =>
    expect(indentSelection("- a\n- b", 0, 7)).toEqual(r("  - a\n  - b", 0, 11)));
  test("빈 줄은 안 건드린다", () =>
    expect(indentSelection("- a\n\n- b", 0, 8)).toEqual(
      r("  - a\n\n  - b", 0, 12)
    ));
  // 고른 범위를 유지해야 Tab 을 두 번 누를 수 있다
  test("두 번 눌러도 된다", () =>
    expect(indentSelection("  - a\n  - b", 0, 11)).toEqual(
      r("    - a\n    - b", 0, 15)
    ));
});

describe("Shift+Tab - 한 단계 올린다", () => {
  test("두 칸 떼기", () =>
    expect(outdentSelection("  - a", 5, 5)).toEqual(r("- a", 3)));
  test("한 칸만 있으면 한 칸", () =>
    expect(outdentSelection(" - a", 4, 4)).toEqual(r("- a", 3)));
  test("탭 문자도 뗀다", () =>
    expect(outdentSelection("\t- a", 4, 4)).toEqual(r("- a", 3)));
  test("뗄 것이 없으면 그대로", () =>
    expect(outdentSelection("- a", 3, 3)).toEqual(r("- a", 3)));
  test("여러 줄", () =>
    expect(outdentSelection("  - a\n  - b", 0, 11)).toEqual(r("- a\n- b", 0, 7)));
  // 안 막으면 커서가 앞 줄로 넘어간다
  test("커서가 줄 시작보다 왼쪽으로 안 간다", () =>
    expect(outdentSelection("  - a", 0, 0)).toEqual(r("- a", 0)));
});

describe("Enter - 목록 이어쓰기", () => {
  test("들여쓰기를 물려받는다", () =>
    expect(continueList("  - a", 5)).toEqual({
      ...r("  - a\n  - ", 10),
      ended: false,
    }));
  test("번호를 올린다", () =>
    expect(continueList("1. a", 4)).toEqual({ ...r("1. a\n2. ", 8), ended: false }));
  test("번호 괄호꼴", () =>
    expect(continueList("3) a", 4)).toEqual({ ...r("3) a\n4) ", 8), ended: false }));
  test("두 자리 번호", () =>
    expect(continueList("9. a", 4)).toEqual({ ...r("9. a\n10. ", 9), ended: false }));
  // 끝낸 체크박스를 물려받으면 새 항목이 이미 체크된 채로 생긴다
  test("체크박스는 빈 칸으로", () =>
    expect(continueList("- [x] a", 7)).toEqual({
      ...r("- [x] a\n- [ ] ", 14),
      ended: false,
    }));
  test("빈 항목이면 목록을 끝낸다", () =>
    expect(continueList("- ", 2)).toEqual({ ...r("", 0), ended: true }));
  test("들여쓴 빈 항목도 끝낸다", () =>
    expect(continueList("  - ", 4)).toEqual({ ...r("", 0), ended: true }));
  test("앞 줄은 남긴다", () =>
    expect(continueList("a\n- ", 4)).toEqual({ ...r("a\n", 2), ended: true }));
  test("목록이 아니면 끼어들지 않는다", () =>
    expect(continueList("hello", 5)).toBeNull());
  test("제목도 아니다", () => expect(continueList("# h", 3)).toBeNull());
});
