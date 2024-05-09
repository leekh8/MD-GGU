import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import TextareaAutosize from "react-textarea-autosize";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const Editor = () => {
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("default");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const handleStyleChange = (e) => {
    setStyle(e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold font-sans text-brand-blue">
          Markdown Editor
        </h1>
        <div className="flex items-center">
          <select
            onChange={handleStyleChange}
            className="p-2 border-brand-grey rounded shadow mr-4"
          >
            <option value="default">Default</option>
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
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
            {copySuccess ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-col md:flex-row">
        <TextareaAutosize
          className="md:flex-1 border-2 border-brand-grey rounded shadow-strong p-4 min-h-[30rem] overflow-auto resize-none"
          onChange={handleChange}
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
