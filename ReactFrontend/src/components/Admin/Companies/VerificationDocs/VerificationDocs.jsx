import React from "react";
import "./VerificationDocs.css";

const VerificationDocs = () => {
  const documents = [
    { name: "Business License.pdf", uploaded: "2 days ago" },
    { name: "Tax Certificate.pdf", uploaded: "2 days ago" },
    { name: "Company Registration.pdf", uploaded: "1 week ago" },
  ];

  return (
    <div className="verification-docs">
      <h3>Verification Documents</h3>

      <div className="docs-list">
        {documents.map((doc, index) => (
          <div key={index} className="doc-item">
            <div className="doc-info">
              <i className="fas fa-file-pdf doc-icon"></i>
              <div>
                <div className="doc-name">{doc.name}</div>
                <div className="doc-uploaded">Uploaded {doc.uploaded}</div>
              </div>
            </div>
            <button className="view-btn">
              <i className="fas fa-eye"></i> View
            </button>
          </div>
        ))}
      </div>

      <button className="request-btn">
        <i className="fas fa-plus"></i> Request More Documents
      </button>
    </div>
  );
};

export default VerificationDocs;
