import React from "react";
import "./index.css";

interface InputFieldProps {
  fieldLabel?: string;
  fieldName: string;
  placeholder: string;
  value: any;
  onChange?: any;
  inputType: "text" | "number" | "password";
  error?: string | null;
  disabled?: boolean;
  containerClassname?: string;
  inputClassname?: string;
  errorClassname?: string;
}

export const InputField = ({
  fieldLabel,
  fieldName,
  placeholder,
  value,
  onChange = () => {},
  inputType,
  error = null,
  disabled = false,
  containerClassname = "",
  inputClassname = "",
  errorClassname,
}: InputFieldProps) => {
  const wheelDisabled = {
    ...(inputType === "number"
      ? { onWheel: (e: any) => e?.target?.blur() }
      : {}),
  };

  return (
    <div className={containerClassname}>
      {fieldLabel && (
        <label
          htmlFor={fieldName}
          className={`fieldLabel ${error ? "fieldLabelError" : ""}`}
        >
          {fieldLabel}
        </label>
      )}
      <div>
        <input
          type={inputType}
          name={fieldName}
          id={fieldName}
          placeholder={placeholder}
          className={inputClassname}
          value={value}
          onChange={onChange}
          key={fieldName}
          disabled={disabled}
          {...wheelDisabled}
        />
      </div>
      {error && (
        <p className={errorClassname || "inputErrorMessage"}>{error}</p>
      )}
    </div>
  );
};
