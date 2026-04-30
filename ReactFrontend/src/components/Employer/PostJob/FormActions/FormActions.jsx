import React from "react";
import "./FormActions.css";

const FormActions = ({ onSaveDraft, onPublish, isSubmitting }) => {
  return (
    <div className="form-actions">
      <button
        type="button"
        className="save-draft"
        onClick={onSaveDraft}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Draft"}
      </button>
      <button
        type="submit"
        className="publish-now"
        onClick={onPublish}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Publishing..." : "Publish Now"}
      </button>
    </div>
  );
};

export default FormActions;
