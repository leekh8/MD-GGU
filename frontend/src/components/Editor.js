// 마크다운 에디터
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const Editor = () => {
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("creative");

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const handleStyleChange = (e) => {
    setStyle(e.target.value);
  };

  const transformText = (text, style) => {
    switch (style) {
      case "creative":
        return text.toUpperCase();
      case "professional":
        return text.toLowerCase();
      default:
        return text;
    }
  };

  const handleCopy = () => {
    const transformedText = transformText(content, style);
    navigator.clipboard.writeText(transformedText);
    alert("Transformed content copied to clipboard!");
  };

  return (
    <div className="container mx-auto px-4 py-4 flex gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Markdown Editor</h1>
          <select onChange={handleStyleChange} className="p-2 border rounded">
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <TextareaAutosize
          className="w-full border rounded shadow p-4 min-h-[20rem] overflow-auto resize-none"
          onChange={handleChange}
          value={content}
          placeholder="Type your markdown here..."
          minRows={10}
        />
      </div>
      <div className="flex-1">
        <button
          onClick={handleCopy}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center mb-4"
        >
          <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
          Copy Transformed Text
        </button>
        <div className="border rounded shadow p-4 min-h-[20rem] overflow-auto">
          <ReactMarkdown>{transformText(content, style)}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Editor;
