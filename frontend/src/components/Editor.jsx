import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import TextareaAutosize from "react-textarea-autosize";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

const Editor = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("default");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const handleKeyDown = (e) => {
    const { key, target } = e;
    const { selectionStart, selectionEnd, value } = target;

    if (key === "Enter") {
      const line = value.substring(0, selectionStart).split("\n").pop();
      if (line === "- ") {
        e.preventDefault(); // 빈 리스트 항목에서 엔터를 눌렀을 때 기본 동작 방지
        const before = value.substring(0, selectionStart - 2); // '- '와 줄바꿈 문자 제거
        const after = value.substring(selectionEnd);
        const newValue = `${before}${after}`;
        setContent(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = before.length;
        }, 0);
      } else if (line.startsWith("- ")) {
        e.preventDefault();
        const before = value.substring(0, selectionStart);
        const after = value.substring(selectionEnd);
        const newValue = `${before}\n- ${after}`;
        setContent(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = selectionStart + 3;
        }, 0);
      }
    } else if (key === "*" && selectionStart !== selectionEnd) {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const selection = value.substring(selectionStart, selectionEnd);
      const after = value.substring(selectionEnd);
      const newValue = `${before}*${selection}*${after}`;
      setContent(newValue);
      setTimeout(() => {
        target.selectionStart = selectionStart + 1;
        target.selectionEnd = selectionEnd + 1;
      }, 0);
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
  // TODO: 저장 기능 추가
  return (
    <div className="container mx-auto px-4 py-4">
      <Helmet>
        <title>
          {t("mdggu")} ・ {t("editor")}
        </title>
      </Helmet>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold font-sans text-brand-blue">
          {t("markdown editor")}
        </h1>
        <div className="flex items-center">
          <select
            onChange={handleStyleChange}
            className="p-2 border-brand-grey rounded shadow mr-4"
          >
            <option value="default">{t("default")}</option>
            <option value="creative">{t("creative")}</option>
            <option value="professional">{t("professional")}</option>
          </select>
          <button
            onClick={handleCopy}
            className={`bg-brand-blue hover:bg-brand-red text-white font-bold py-2 px-4 rounded flex items-center ${
              copySuccess ? "bg-green-500" : ""
            }`}
          >
            {copySuccess ? (
              <CheckIcon className="h-5 w-5 mr-2" />
            ) : (
              <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
            )}
            {copySuccess ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-col md:flex-row">
        <TextareaAutosize
          className="md:flex-1 border-2 border-brand-grey rounded shadow-strong p-4 min-h-[30rem] overflow-auto resize-none"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={content}
          placeholder="Type your markdown here..."
          minRows={10}
        />
        <div className="md:flex-1 border-2 border-brand-grey rounded shadow-strong p-4 min-h-[30rem] overflow-auto">
          <ReactMarkdown
            className="prose"
            remarkPlugins={[remarkGfm, rehypeKatex]}
            rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Editor;
