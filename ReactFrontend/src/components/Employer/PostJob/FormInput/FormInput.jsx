import React from "react";
import "./FormInput.css";

const FormInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = true,
}) => {
  return (
    <div className="form-input">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={4}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
        />
      )}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default FormInput;
