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
  DocumentArrowDownIcon,
  FolderOpenIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { optimizeMarkdown, createDocument } from "../api";
import { useAuth } from "./AuthProvider";

// ── 툴바 버튼 정의 ─────────────────────────────────────────────────────────────
const TOOLBAR_GROUPS = [
  [
    { label: "B",   title: "Bold (Ctrl+B)",    action: (w) => w("**") },
    { label: "I",   title: "Italic (Ctrl+I)",  action: (w) => w("*"),  italic: true },
    { label: "S",   title: "Strikethrough",    action: (w) => w("~~"), strike: true },
  ],
  [
    { label: "H1",  title: "Heading 1",        action: (w) => w("# ",    "",    true) },
    { label: "H2",  title: "Heading 2",        action: (w) => w("## ",   "",    true) },
    { label: "H3",  title: "Heading 3",        action: (w) => w("### ",  "",    true) },
  ],
  [
    { label: "`",   title: "Inline code",      action: (w) => w("`") },
    { label: "```", title: "Code block (Ctrl+Shift+M)", action: (w) => w("\n```\n", "\n```\n") },
  ],
  [
    { label: "❝",   title: "Blockquote",       action: (w) => w("> ",    "",    true) },
    { label: "—",   title: "Unordered list",   action: (w) => w("- ",    "",    true) },
    { label: "1.",  title: "Ordered list",     action: (w) => w("1. ",   "",    true) },
  ],
  [
    { label: "🔗",  title: "Link (Ctrl+K)",    action: (w) => w("[",     "](https://)") },
  ],
];

const ToolbarButton = ({ label, title, italic, strike, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`
      px-2 py-1 rounded text-sm font-mono border border-gray-200 dark:border-gray-600
      bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
      hover:bg-gray-100 dark:hover:bg-gray-600
      transition-colors duration-100 select-none
      ${italic ? "italic" : ""}
      ${strike ? "line-through" : ""}
    `}
  >
    {label}
  </button>
);

// ── Editor ────────────────────────────────────────────────────────────────────
const Editor = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [content, setContent]       = useState("");
  const [style, setStyle]           = useState("default");
  const [fileName, setFileName]     = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const textAreaRef                 = useRef(null);

  // 단축키 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  // 최적화
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [isOptimizing, setIsOptimizing]     = useState(false);

  // 문서 저장 모달
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [docTitle, setDocTitle]               = useState("");
  const [isSaving, setIsSaving]               = useState(false);
  const [saveMessage, setSaveMessage]         = useState(null);
  const saveModalRef = useRef(null);

  // 통계
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  // 자동 저장
  useEffect(() => {
    const saved = localStorage.getItem("markdownContent");
    if (saved) setContent(saved);
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);
    localStorage.setItem("markdownContent", e.target.value);
    saveHistory(e.target.value);
  };

  // ── Undo 히스토리 ──────────────────────────────────────────────────────────
  const [history, setHistory]         = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveHistory = (newContent) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newContent]);
    setHistoryIndex(newHistory.length);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setContent(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // ── 텍스트 감싸기 (토글) ───────────────────────────────────────────────────
  const wrapSelection = (
    wrapperStart,
    wrapperEnd = wrapperStart,
    forceLineStart = false
  ) => {
    if (!textAreaRef.current) return;
    const { selectionStart, selectionEnd, value } = textAreaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const before = value.substring(0, selectionStart);
    const after  = value.substring(selectionEnd);
    const wrappedText = `${wrapperStart}${selectedText}${wrapperEnd}`;

    if (
      value.substring(
        selectionStart - wrapperStart.length,
        selectionEnd + wrapperEnd.length
      ) === wrappedText
    ) {
      setContent(
        `${before.slice(0, -wrapperStart.length)}${selectedText}${after.slice(wrapperEnd.length)}`
      );
      setTimeout(() => {
        textAreaRef.current.selectionStart = selectionStart - wrapperStart.length;
        textAreaRef.current.selectionEnd   = selectionEnd   - wrapperEnd.length;
      }, 0);
    } else if (forceLineStart) {
      const lastNewline = before.lastIndexOf("\n") + 1;
      const lineStart   = before.substring(lastNewline);
      if (lineStart.startsWith(wrapperStart)) {
        setContent(
          `${before.slice(0, lastNewline)}${lineStart.slice(wrapperStart.length)}${after}`
        );
        setTimeout(() => {
          textAreaRef.current.selectionStart =
          textAreaRef.current.selectionEnd = selectionStart - wrapperStart.length;
        }, 0);
      } else {
        setContent(
          `${before.slice(0, lastNewline)}${wrapperStart}${lineStart}${after}`
        );
        setTimeout(() => {
          textAreaRef.current.selectionStart =
          textAreaRef.current.selectionEnd = selectionStart + wrapperStart.length;
        }, 0);
      }
    } else {
      setContent(`${before}${wrapperStart}${selectedText}${wrapperEnd}${after}`);
      setTimeout(() => {
        textAreaRef.current.selectionStart = selectionStart + wrapperStart.length;
        textAreaRef.current.selectionEnd   = selectionEnd   + wrapperStart.length;
      }, 0);
    }
  };

  // ── 단축키 ─────────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const { key, ctrlKey, shiftKey, altKey } = e;

    if (ctrlKey && key === "b")                          { e.preventDefault(); wrapSelection("**"); }
    else if (ctrlKey && (key === "i" || key === "*"))    { e.preventDefault(); wrapSelection("*"); }
    else if (ctrlKey && key === "k")                     { e.preventDefault(); wrapSelection("[", "](https://)"); }
    else if (ctrlKey && (key === "h" || key === "3"))    { e.preventDefault(); wrapSelection("# ", "", true); }
    else if (ctrlKey && shiftKey && key === "M")         { e.preventDefault(); wrapSelection("\n```\n", "\n```\n"); }
    else if (ctrlKey && (key === ">" || (shiftKey && key === ">"))) { e.preventDefault(); wrapSelection("> ", "", true); }
    else if (ctrlKey && key === "z")                     { e.preventDefault(); undo(); }
    else if (altKey && key === "h")                      { e.preventDefault(); toggleModal(); }
    else if (ctrlKey && key === "s")                     { e.preventDefault(); openSaveModal(); }

    // Enter 리스트 자동완성
    const { selectionStart, value } = e.target;
    const line = value.substring(0, selectionStart).split("\n").pop();
    if (key === "Enter") {
      if (line === "- ") {
        e.preventDefault();
        const before = value.substring(0, selectionStart - 2);
        const after  = value.substring(selectionStart);
        setContent(`${before}${after}`);
        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = before.length; }, 0);
      } else if (line.startsWith("- ")) {
        e.preventDefault();
        const before = value.substring(0, selectionStart);
        const after  = value.substring(selectionStart);
        setContent(`${before}\n- ${after}`);
        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = selectionStart + 3; }, 0);
      }
    }
  };

  // ── 유틸 핸들러 ────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setContent(ev.target.result);
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save("document.pdf");
  };

  // ── 최적화 ─────────────────────────────────────────────────────────────────
  const handleOptimize = async () => {
    if (!content.trim()) return;
    setIsOptimizing(true);
    setOptimizeResult(null);
    try {
      const result = await optimizeMarkdown(content);
      setOptimizeResult(result);
    } catch {
      setOptimizeResult({ error: t("optimizeError") });
    } finally {
      setIsOptimizing(false);
    }
  };

  // ── 문서 저장 ──────────────────────────────────────────────────────────────
  const openSaveModal = () => {
    if (!user) { navigate("/login"); return; }
    const firstLine = content.split("\n")[0].replace(/^#+\s*/, "").trim();
    setDocTitle(firstLine || "");
    setSaveMessage(null);
    setIsSaveModalOpen(true);
  };

  const handleSaveDocument = async () => {
    if (!docTitle.trim()) { setSaveMessage({ type: "error", text: t("titleRequired") }); return; }
    setIsSaving(true);
    try {
      const created = await createDocument({ title: docTitle.trim(), content });
      setSaveMessage({ type: "success", text: t("documentSaved") });
      setTimeout(() => {
        setIsSaveModalOpen(false);
        navigate(`/documents/${created.data?.id || ""}`);
      }, 800);
    } catch {
      setSaveMessage({ type: "error", text: t("documentSaveFailed") });
    } finally {
      setIsSaving(false);
    }
  };

  // ── 모달 공통 ──────────────────────────────────────────────────────────────
  const toggleModal = () => setIsModalOpen((v) => !v);

  useEffect(() => {
    const onKey  = (e) => { if (e.key === "Escape") { setIsModalOpen(false); setIsSaveModalOpen(false); } };
    const onClickShortcut = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) setIsModalOpen(false); };
    const onClickSave     = (e) => { if (saveModalRef.current && !saveModalRef.current.contains(e.target)) setIsSaveModalOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickShortcut);
    document.addEventListener("mousedown", onClickSave);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickShortcut);
      document.removeEventListener("mousedown", onClickSave);
    };
  }, []);

  // ── 렌더 ───────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto">
      <Helmet>
        <title>{t("mdggu")} ・ {t("editor")}</title>
      </Helmet>

      {/* ── 상단 헤더 ─────────────────────────────────────────────── */}
      <div className="pt-4 flex flex-col md:flex-row md:justify-between items-center mb-3">
        <h1>{t("markdown editor")}</h1>
        <div className="flex items-center mt-2 md:mt-0 gap-2">
          <select onChange={(e) => setStyle(e.target.value)} value={style}>
            <option value="default">{t("default")}</option>
            <option value="creative">{t("creative")}</option>
            <option value="professional">{t("professional")}</option>
          </select>

          {/* 단축키 안내 버튼 */}
          <button
            onClick={toggleModal}
            title={t("shortcutGuide")}
            className="p-2 border rounded dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* ── 포맷 툴바 ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && (
              <div className="w-px bg-gray-200 dark:bg-gray-600 mx-0.5 self-stretch" />
            )}
            {group.map((btn) => (
              <ToolbarButton
                key={btn.label}
                label={btn.label}
                title={btn.title}
                italic={btn.italic}
                strike={btn.strike}
                onClick={() => { textAreaRef.current?.focus(); btn.action(wrapSelection); }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ── 액션 버튼 행 ──────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        {/* 좌측: 복사, 파일 열기 */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleCopy}
            className={`btn w-10 md:w-auto ${copySuccess ? "bg-green-500 hover:bg-green-600" : "btn-primary"}`}
            title={t("copy")}
          >
            {copySuccess ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
            <span className="ml-2 hidden md:inline">{copySuccess ? t("copied") : t("copy")}</span>
          </button>

          <input type="file" accept=".md" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label
            htmlFor="file-upload"
            title={t("openFile")}
            className="btn btn-secondary cursor-pointer w-10 md:w-auto"
          >
            <FolderOpenIcon className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">{t("openFile")}</span>
          </label>
          {fileName && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={fileName}>
              {fileName}
            </span>
          )}
        </div>

        {/* 우측: 최적화, 저장, 다운로드, PDF */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing || !content.trim()}
            title={t("optimize")}
            className="btn btn-primary w-10 md:w-auto disabled:opacity-50"
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">
              {isOptimizing ? t("optimizing") : t("optimize")}
            </span>
          </button>

          <button
            onClick={openSaveModal}
            disabled={!content.trim()}
            title={t("saveToDocument")}
            className="btn btn-secondary w-10 md:w-auto disabled:opacity-50"
          >
            <DocumentPlusIcon className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">{t("saveToDocument")}</span>
          </button>

          <button onClick={handleDownload} title={t("downloadMd")} className="btn btn-secondary w-10 md:w-auto">
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">{t("downloadMd")}</span>
          </button>

          <button onClick={exportToPDF} title={t("exportPdf")} className="btn btn-danger w-10 md:w-auto">
            <span className="hidden md:inline">{t("exportPdf")}</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* ── 에디터 / 미리보기 ─────────────────────────────────────── */}
      <div className="flex gap-4 flex-col md:flex-row">
        {/* 입력창 */}
        <div className="md:w-1/2 flex flex-col">
          <TextareaAutosize
            ref={textAreaRef}
            className="input-box font-mono text-sm"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={content}
            placeholder={t("editorPlaceholder")}
            minRows={10}
            style={{ flexGrow: 1 }}
          />
          <div className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
            {wordCount} {t("words")} · {charCount} {t("chars")}
          </div>
        </div>

        {/* 미리보기 */}
        <div className="md:w-1/2 preview-box">
          <ReactMarkdown className="prose" remarkPlugins={[remarkGfm, rehypeKatex]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* ── 최적화 결과 패널 ──────────────────────────────────────── */}
      {optimizeResult && (
        <div className="mt-6 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-yellow-500" />
              {t("optimize result")}
            </h3>
            <button onClick={() => setOptimizeResult(null)} className="p-1 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {optimizeResult.error ? (
            <p className="text-red-500 text-sm">{optimizeResult.error}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {optimizeResult.summary && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">📋 {t("summary")}</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{optimizeResult.summary}</p>
                </div>
              )}
              {optimizeResult.emojis?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">😊 {t("suggested emojis")}</p>
                  <div className="flex gap-2 text-2xl">{optimizeResult.emojis.map((e, i) => <span key={i}>{e}</span>)}</div>
                </div>
              )}
              {optimizeResult.refs?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">🔗 {t("references")}</p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {optimizeResult.refs.map((ref, i) => <li key={i} className="font-mono">{ref}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 단축키 모달 ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">⌨️ {t("shortcutGuide")}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              {[
                ["Ctrl + B",          t("shortcut.bold")],
                ["Ctrl + I",          t("shortcut.italic")],
                ["Ctrl + K",          t("shortcut.link")],
                ["Ctrl + H",          t("shortcut.heading")],
                ["Ctrl + Shift + M",  t("shortcut.codeBlock")],
                ["Ctrl + S",          t("shortcut.save")],
                ["Ctrl + Z",          t("shortcut.undo")],
                ["Alt + H",           t("shortcut.openGuide")],
              ].map(([key, desc]) => (
                <li key={key} className="flex justify-between">
                  <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">{key}</kbd>
                  <span className="text-right">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 문서 저장 모달 ───────────────────────────────────────── */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div ref={saveModalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t("saveToDocument")}</h2>
              <button onClick={() => setIsSaveModalOpen(false)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="form-label mb-1">{t("documentTitle")}</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveDocument(); }}
                placeholder={t("documentTitle")}
                className="form-input"
                autoFocus
              />
            </div>
            {saveMessage && (
              <p className={`text-sm mb-3 ${saveMessage.type === "error" ? "text-red-500" : "text-green-600"}`}>
                {saveMessage.text}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsSaveModalOpen(false)} className="btn btn-secondary">
                {t("cancel")}
              </button>
              <button onClick={handleSaveDocument} disabled={isSaving} className="btn btn-primary disabled:opacity-60">
                {isSaving ? t("loading") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
