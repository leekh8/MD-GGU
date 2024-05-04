import React, { useEffect, useState } from "react";
import { getAllDocuments } from "../api";
import { Link } from "react-router-dom";
function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await getAllDocuments();
        setDocuments(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to fetch documents");
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Documents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <Link
              to={`/documents/${document.id}`}
              className="text-lg text-blue-500 hover:text-blue-700"
            >
              {document.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentList;
