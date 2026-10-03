import { useEffect, useState } from "react";

import { useAuth } from "../context/useAuth";

function DocumentList({ refreshTrigger }) {
  const { token } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDocuments = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/documents",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to load documents."
          );
        }

        if (isMounted) {
          setDocuments(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error.message ||
              "Unable to load your documents."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [token, refreshTrigger]);

  const handleDelete = async (
    documentId,
    filename
  ) => {
    const confirmed = window.confirm(
      `Delete "${filename}"?\n\nThis will remove the document from your study materials.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(documentId);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to delete the document."
        );
      }

      setDocuments((previousDocuments) =>
        previousDocuments.filter(
          (document) =>
            document.id !== documentId
        )
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to delete the document."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = documents.filter(
    (document) =>
      document.filename
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={`documents-sidebar ${
        isOpen ? "open" : "collapsed"
      }`}
    >
      <div className="documents-sidebar-header">
        {isOpen && (
          <div>
            <h2>My Study Materials</h2>
            <p>Your uploaded PDFs</p>
          </div>
        )}

        <button
          type="button"
          className="documents-toggle"
          onClick={() =>
            setIsOpen(
              (previous) => !previous
            )
          }
          aria-label={
            isOpen
              ? "Collapse study materials"
              : "Open study materials"
          }
        >
          {isOpen ? "◀" : "▶"}
        </button>
      </div>

      {isOpen && (
        <div className="documents-sidebar-content">
          {!loading && !error && (
            <div className="document-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search documents..."
                aria-label="Search documents"
              />
            </div>
          )}

          {loading && (
            <p className="documents-sidebar-status">
              Loading documents...
            </p>
          )}

          {error && (
            <div className="documents-sidebar-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            documents.length === 0 && (
              <p className="documents-sidebar-status">
                No study materials uploaded yet.
              </p>
            )}

          {!loading &&
            !error &&
            documents.length > 0 &&
            filteredDocuments.length === 0 && (
              <p className="documents-sidebar-status">
                No documents found.
              </p>
            )}

          {!loading &&
            !error &&
            filteredDocuments.length > 0 && (
              <div className="documents-sidebar-list">
                {filteredDocuments.map(
                  (document) => (
                    <div
                      className="sidebar-document-card"
                      key={document.id}
                    >
                      <div className="sidebar-document-icon">
                        PDF
                      </div>

                      <div className="sidebar-document-info">
                        <h3>
                          {document.filename}
                        </h3>

                        <p>
                          Uploaded{" "}
                          {new Date(
                            document.uploaded_at
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="sidebar-delete-button"
                        onClick={() =>
                          handleDelete(
                            document.id,
                            document.filename
                          )
                        }
                        disabled={
                          deletingId ===
                          document.id
                        }
                        aria-label={`Delete ${document.filename}`}
                      >
                        {deletingId ===
                        document.id
                          ? "..."
                          : "×"}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      )}
    </aside>
  );
}

export default DocumentList;