import { useRef, useState } from "react";

import { useAuth } from "../context/useAuth";

function DocumentUpload({ onUploadSuccess }) {
  const { token } = useAuth();

  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (selectedFile) => {
    setMessage("");
    setError("");

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files[0];

    selectFile(selectedFile);

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    if (loading) return;

    const droppedFile =
      event.dataTransfer.files[0];

    selectFile(droppedFile);
  };

  const openFilePicker = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please select a PDF file first."
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed."
        );
      }

      setMessage(
        `${data.filename} is ready to study.`
      );

      setFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(
          data.document_id
        );
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to upload the PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="upload-section">
      <div className="upload-card-header">
        <div className="upload-card-title-group">
          <div className="upload-main-icon">
            <span>+</span>
          </div>

          <div>
            <span className="upload-eyebrow">
              STUDY MATERIAL
            </span>

            <h2>
              Upload your study material
            </h2>

            <p>
              Add a PDF and turn it into
              an interactive study workspace.
            </p>
          </div>
        </div>

        <div className="upload-file-badge">
          <strong>PDF</strong>
          <small>
            Academic material
          </small>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        disabled={loading}
        className="upload-hidden-input"
      />

      <div
        className={`upload-dropzone ${
          isDragging
            ? "upload-dropzone-active"
            : ""
        } ${
          file
            ? "upload-dropzone-selected"
            : ""
        }`}
        onClick={openFilePicker}
        onDragOver={(event) => {
          event.preventDefault();

          if (!loading) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() =>
          setIsDragging(false)
        }
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openFilePicker();
          }
        }}
      >
        <div className="upload-drop-icon">
          <span>
            {file ? "✓" : "PDF"}
          </span>
        </div>

        <div className="upload-drop-content">
          {file ? (
            <>
              <strong className="upload-file-name">
                {file.name}
              </strong>

              <span>
                PDF selected · Click to
                choose another
              </span>
            </>
          ) : (
            <>
              <strong>
                Drop your PDF here
              </strong>

              <span>
                or{" "}
                <button
                  type="button"
                  className="upload-browse-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openFilePicker();
                  }}
                >
                  browse from your computer
                </button>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="upload-card-footer">
        <div className="upload-privacy">
          <span className="upload-check-icon">
            ✓
          </span>

          <span>
            Your material stays private
            to your account.
          </span>
        </div>

        <button
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={
            loading || !file
          }
        >
          {loading ? (
            <>
              <span className="upload-spinner" />
              Processing PDF...
            </>
          ) : (
            <>
              Upload &amp; Study
              <span className="upload-button-arrow">
                →
              </span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="upload-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="upload-error">
          <span>!</span>
          {error}
        </div>
      )}
    </section>
  );
}

export default DocumentUpload;