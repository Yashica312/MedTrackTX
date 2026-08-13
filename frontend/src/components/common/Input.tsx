import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      <div className="input-wrapper">
        {icon && (
          <span className="input-icon">
            {icon}
          </span>
        )}

        <input
          {...props}
          id={id}
          className={`form-input ${
            icon ? "has-icon" : ""
          } ${error ? "input-error" : ""} ${className}`}
        />
      </div>

      {error && (
        <span className="form-error">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
}