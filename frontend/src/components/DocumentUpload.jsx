import { useState } from "react";

import { useAuth } from "../context/useAuth";

function DocumentUpload({onUploadSuccess}) {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
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
        `${data.filename} uploaded successfully.`
      );

      setFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(data.document_id);
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
      <div className="upload-heading">
        <div>
          <h2>Upload Study Material</h2>

          <p>
            Upload a PDF to study from it with EduRAG.
          </p>
        </div>
      </div>

      <div className="upload-controls">
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={loading}
        />

        {file && (
          <p className="selected-file">
            Selected: {file.name}
          </p>
        )}

        <button
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading
            ? "Processing PDF..."
            : "Upload PDF"}
        </button>
      </div>

      {message && (
        <div className="upload-success">
          {message}
        </div>
      )}

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
    </section>
  );
}

export default DocumentUpload;