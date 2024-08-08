// 특정 문서의 상세 정보
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById, updateDocument } from "../api";
import { useTranslation } from "react-i18next";

function DocumentDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await getDocumentById(id);
        setDocument(response.data);
        setTitle(response.data.title);
        setContent(response.data.content);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching document:", error);
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const handleUpdate = async () => {
    const updated = await updateDocument(id, { title, content });
    setDocument(updated.data);
    setEditMode(false);
  };

  if (loading) return <p>Loading...</p>;

  if (!document) return <p>Document not found.</p>;

  return (
    <div className="container mx-auto px-4 py-4">
      {editMode ? (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("save")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">{document.title}</h1>
          <p className="text-gray-700">{document.content}</p>
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("edit")}
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentDetail;
