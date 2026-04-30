import React from "react";
import "./EditButton.css";

const EditButton = ({ editMode, onClick }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <button className="edit-button" onClick={handleClick}>
      {editMode ? "Cancel" : "Edit"}
    </button>
  );
};

export default EditButton;
