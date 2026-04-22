import React, { useEffect, useState, useCallback } from "react";
import { getAllDocuments } from "../api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { DocumentTextIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const SkeletonCard = () => (
  <div className="card">
    <div className="skeleton h-5 w-3/4 mb-2" />
    <div className="skeleton h-3 w-1/2" />
  </div>
);

function DocumentList() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(t("fetchDocumentsFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {t("documents")}</title>
      </Helmet>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("documents")}
          </h1>
          <Link to="/editor" className="btn btn-primary px-4 py-2 text-sm">
            + {t("newDocument")}
          </Link>
        </div>

        {/* 에러 상태 */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchDocuments}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              {t("retry")}
            </button>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {t("noDocuments")}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
              {t("noDocumentsHint")}
            </p>
            <Link to="/editor" className="btn btn-primary">
              {t("start editing")}
            </Link>
          </div>
        )}

        {/* 문서 목록 */}
        {!loading && !error && documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="card block group"
              >
                <div className="flex items-start gap-3">
                  <DocumentTextIcon className="h-5 w-5 text-brand-blue dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-800 dark:text-white font-medium truncate group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
                      {doc.title || t("untitled")}
                    </p>
                    {doc.updatedAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DocumentList;
