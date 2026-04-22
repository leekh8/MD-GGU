import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import TextareaAutosize from "react-textarea-autosize";
import {
  ClipboardDocumentIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { optimizeMarkdown } from "../api";

const Editor = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("default");
  const [fileName, setFileName] = useState("선택된 파일 없음");
  const [copySuccess, setCopySuccess] = useState(false);
  const textAreaRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 자동 저장 기능
  useEffect(() => {
    const savedContent = localStorage.getItem("markdownContent");
    if (savedContent) setContent(savedContent);
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);
    localStorage.setItem("markdownContent", e.target.value); // 자동 저장
    saveHistory(e.target.value); // undo 히스토리 저장
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save("document.pdf");
  };

  // 선택한 텍스트 감싸는 기능 (useRef 활용)
  const wrapSelection = (
    wrapperStart,
    wrapperEnd = wrapperStart,
    forceLineStart = false
  ) => {
    if (!textAreaRef.current) return;

    const { selectionStart, selectionEnd, value } = textAreaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);

    // 즉시 토글 기능: 이미 감싸져 있다면 제거
    const wrappedText = `${wrapperStart}${selectedText}${wrapperEnd}`;
    if (
      value.substring(
        selectionStart - wrapperStart.length,
        selectionEnd + wrapperEnd.length
      ) === wrappedText
    ) {
      // 기존 서식을 감싸고 있는 경우 → 해제
      setContent(
        `${before.slice(0, -wrapperStart.length)}${selectedText}${after.slice(
          wrapperEnd.length
        )}`
      );
      setTimeout(() => {
        textAreaRef.current.selectionStart =
          selectionStart - wrapperStart.length;
        textAreaRef.current.selectionEnd = selectionEnd - wrapperEnd.length;
      }, 0);
    } else {
      // 특정 서식은 줄의 시작에서만 적용 (제목, 인용문)
      if (forceLineStart) {
        const lastNewline = before.lastIndexOf("\n") + 1;
        const lineStart = before.substring(lastNewline);

        if (lineStart.startsWith(wrapperStart)) {
          // 이미 적용된 경우 → 제거
          setContent(
            `${before.slice(0, lastNewline)}${lineStart.slice(
              wrapperStart.length
            )}${after}`
          );
          setTimeout(() => {
            textAreaRef.current.selectionStart =
              textAreaRef.current.selectionEnd =
                selectionStart - wrapperStart.length;
          }, 0);
        } else {
          // 적용
          setContent(
            `${before.slice(0, lastNewline)}${wrapperStart}${lineStart}${after}`
          );
          setTimeout(() => {
            textAreaRef.current.selectionStart =
              textAreaRef.current.selectionEnd =
                selectionStart + wrapperStart.length;
          }, 0);
        }
      } else {
        // 서식 적용 (즉시 토글 가능)
        setContent(
          `${before}${wrapperStart}${selectedText}${wrapperEnd}${after}`
        );
        setTimeout(() => {
          textAreaRef.current.selectionStart =
            selectionStart + wrapperStart.length;
          textAreaRef.current.selectionEnd = selectionEnd + wrapperStart.length;
        }, 0);
      }
    }
  };

  // 실행 취소 (Ctrl+Z) 기능 추가
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveHistory = (newContent) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newContent]);
    setHistoryIndex(newHistory.length);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1];
      setContent(prevContent);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // 단축키 이벤트 처리
  const handleKeyDown = (e) => {
    const { key, ctrlKey, shiftKey, altKey } = e;

    if (ctrlKey && key === "b") {
      e.preventDefault();
      wrapSelection("**"); // Ctrl+B: 굵게 (토글 가능)
    } else if (
      ctrlKey &&
      (key === "i" || key === "*" || (shiftKey && key === "8"))
    ) {
      e.preventDefault();
      wrapSelection("*"); // Ctrl+I / Ctrl+Shift+8 / Ctrl+*: 이탤릭 (토글 가능)
    } else if (ctrlKey && key === "k") {
      e.preventDefault();
      wrapSelection("[", "](https://)"); // Ctrl+K: 링크 삽입
    } else if (
      ctrlKey &&
      (key === "h" || key === "3" || (shiftKey && key === "3"))
    ) {
      e.preventDefault();
      wrapSelection("# ", "", true); // Ctrl+H / Ctrl+Shift+3 / Shift+3: 제목 (토글)
    } else if (ctrlKey && shiftKey && key === "M") {
      e.preventDefault();
      wrapSelection("\n```\n", "\n```\n"); // Ctrl+Shift+M: 블록 코드
    } else if (ctrlKey && (key === ">" || (shiftKey && key === ">"))) {
      e.preventDefault();
      wrapSelection("> ", "", true); // Ctrl+Shift+> / Ctrl+>: 인용문 (토글)
    } else if (ctrlKey && key === "z") {
      e.preventDefault();
      undo(); // 실행 취소 (Ctrl+Z)
    } else if (altKey && e.key === "h") {
      e.preventDefault();
      toggleModal();
    }

    // Enter 입력 시 리스트 자동완성 기능 유지
    const { selectionStart, value } = e.target;
    const line = value.substring(0, selectionStart).split("\n").pop();

    if (key === "Enter") {
      if (line === "- ") {
        e.preventDefault();
        const before = value.substring(0, selectionStart - 2);
        const after = value.substring(selectionStart);
        setContent(`${before}${after}`);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = before.length;
        }, 0);
      } else if (line.startsWith("- ")) {
        e.preventDefault();
        const before = value.substring(0, selectionStart);
        const after = value.substring(selectionStart);
        setContent(`${before}\n- ${after}`);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = selectionStart + 3;
        }, 0);
      }
    }
  };

  const handleStyleChange = (e) => {
    setStyle(e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // 선택된 파일명 표시
      const reader = new FileReader();
      reader.onload = (event) => setContent(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.md";
    link.click();
  };

  // 모달 열기/닫기 토글 함수
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // 마크다운 최적화
  const handleOptimize = async () => {
    if (!content.trim()) return;
    setIsOptimizing(true);
    setOptimizeResult(null);
    try {
      const result = await optimizeMarkdown(content);
      setOptimizeResult(result);
    } catch (err) {
      setOptimizeResult({ error: "최적화 중 오류가 발생했습니다." });
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    // ESC 키 감지하여 모달 닫기
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    // 모달 바깥 클릭 감지하여 모달 닫기
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("mousedown", handleClickOutside);

    // 컴포넌트가 언마운트되면 리스너 제거
    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container mx-auto ">
      <HelmetProvider>
        <Helmet>
          <title>
            {t("mdggu")} ・ {t("editor")}
          </title>
        </Helmet>
      </HelmetProvider>

      {/* 상단 메뉴 (스타일 선택) */}
      <div className="pt-4 flex flex-col md:flex-row md:justify-between items-center mb-4">
        <h1>{t("markdown editor")}</h1>
        <div className="flex items-center mt-2 md:mt-0 gap-2">
          <select onChange={handleStyleChange}>
            <option value="default">{t("default")}</option>
            <option value="creative">{t("creative")}</option>
            <option value="professional">{t("professional")}</option>
          </select>

          {/* "?" 아이콘 버튼 */}
          <button
            onClick={toggleModal}
            className="p-2 border rounded dark:border-gray-700"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          {/* 단축키 모달 UI */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    ⌨️ 단축키 가이드
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 dark:bg-gray-800 dark:text-white rounded"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <ul className="text-gray-700 dark:text-gray-300">
                  <li>
                    <b>Ctrl + B</b> - 굵게
                  </li>
                  <li>
                    <b>Ctrl + I</b> - 이탤릭
                  </li>
                  <li>
                    <b>Ctrl + K</b> - 링크 추가
                  </li>
                  <li>
                    <b>Ctrl + Shift + M</b> - 코드 블록
                  </li>
                  <li>
                    <b>Ctrl + Z</b> - 실행 취소
                  </li>
                  <li>
                    <b>Alt + H</b> - 단축키 가이드 열기
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 버튼 그룹 (복사, 파일 업로드, 다운로드, PDF 저장) */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        {/* 좌측: 복사 버튼 & 파일 선택 */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`btn btn-primary w-40 ${
              copySuccess ? "bg-green-500" : ""
            }`}
          >
            {copySuccess ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <ClipboardDocumentIcon className="h-5 w-5" />
            )}{" "}
            <span className="ml-2 hidden md:inline">
              {copySuccess ? t("copied") : t("copy")}
            </span>
          </button>
          <input
            type="file"
            accept=".md"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn btn-secondary w-40 text-center cursor-pointer "
          >
            📂 파일 선택
          </label>
          <span className="text-gray-500 ">{fileName}</span>
        </div>
        {/* 우측: AI 최적화, 다운로드 & PDF 저장 */}{" "}
        <div className="flex gap-2">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing || !content.trim()}
            className="btn btn-primary w-40"
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">
              {isOptimizing ? t("optimizing") : t("optimize")}
            </span>
          </button>
          <button onClick={handleDownload} className="btn btn-secondary w-40">
            📥 .md 다운로드
          </button>
          <button onClick={exportToPDF} className="btn btn-danger w-40">
            📄 PDF 저장
          </button>
        </div>
      </div>

      {/* 입력창 & 미리보기 영역 */}
      <div className="flex gap-4 flex-col md:flex-row">
        {/* 📝 입력창 */}
        <div className="md:w-1/2 flex flex-col">
          <TextareaAutosize
            ref={textAreaRef} // useRef 연결 (단축키 기능 작동을 위해 필수)
            className="input-box"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={content}
            placeholder="Type your markdown here..."
            minRows={10}
            style={{ flexGrow: 1 }}
          />
          <div className="text-right text-sm text-gray-500 mt-2 px-2">
            📝 {wordCount} 단어 • {charCount} 글자
          </div>
        </div>

        {/* 🔍 미리보기 창 */}
        <div className="md:w-1/2 preview-box">
          <ReactMarkdown
            className="prose"
            remarkPlugins={[remarkGfm, rehypeKatex]}
            // rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* ✨ 최적화 결과 패널 */}
      {optimizeResult && (
        <div className="mt-6 p-4 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-yellow-500" />
              {t("optimize result")}
            </h3>
            <button
              onClick={() => setOptimizeResult(null)}
              className="p-1 rounded dark:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {optimizeResult.error ? (
            <p className="text-red-500">{optimizeResult.error}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 요약 */}
              {optimizeResult.summary && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    📋 {t("summary")}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                    {optimizeResult.summary}
                  </p>
                </div>
              )}

              {/* 이모지 추천 */}
              {optimizeResult.emojis?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    😊 {t("suggested emojis")}
                  </p>
                  <div className="flex gap-2 text-2xl">
                    {optimizeResult.emojis.map((emoji, i) => (
                      <span key={i}>{emoji}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 참고링크 */}
              {optimizeResult.refs?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    🔗 {t("references")}
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 list-none space-y-1">
                    {optimizeResult.refs.map((ref, i) => (
                      <li key={i} className="font-mono">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Editor;
