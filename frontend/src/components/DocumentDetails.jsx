import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, updateDocument, deleteDocument } from "../api";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

function DocumentDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await getDocumentById(id);
        const doc = response.data;
        setDocument(doc);
        setTitle(doc.title || "");
        setContent(doc.content || "");
      } catch {
        // 에러는 document === null 으로 처리
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updated = await updateDocument(id, { title, content });
      setDocument(updated.data);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("confirmDelete"))) return;
    setDeleting(true);
    try {
      await deleteDocument(id);
      navigate("/documents");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(document.title || "");
    setContent(document.content || "");
    setEditMode(false);
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-1/2" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      </div>
    );

  if (!document)
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 dark:text-gray-400">{t("documentNotFound")}</p>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {document.title || t("untitled")}</title>
      </Helmet>
      <div className="container mx-auto px-4 py-6">
        {editMode ? (
          /* ── 편집 모드 ── */
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("documentTitle")}
              className="form-input text-lg font-semibold"
            />
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-input font-mono resize-y"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                <CheckIcon className="h-4 w-4" />
                {saving ? t("loading") : t("save")}
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          /* ── 보기 모드 ── */
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white break-all">
                {document.title || t("untitled")}
              </h1>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditMode(true)}
                  className="btn btn-secondary flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("edit")}</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger flex items-center gap-1 disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("delete")}</span>
                </button>
              </div>
            </div>
            {document.updatedAt && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(document.updatedAt).toLocaleString()}
              </p>
            )}
            <div className="preview-box">
              <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
                {document.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DocumentDetail;
