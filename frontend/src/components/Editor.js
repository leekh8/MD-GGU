// 마크다운 에디터
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const Editor = () => {
  const [content, setContent] = useState("");

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <textarea
        className="editor-input flex-1 p-2 border rounded shadow-inner h-96"
        onChange={handleChange}
        value={content}
        placeholder="Type your markdown here..."
      />
      <div className="preview flex-1 p-2 border rounded shadow bg-white h-96 overflow-y-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Editor;
