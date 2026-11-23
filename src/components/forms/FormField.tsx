import React from 'react';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  error,
  htmlFor,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`tl-field ${className}`.trim()} {...props}>
      <label htmlFor={htmlFor} className="tl-field-label">
        {label}
      </label>
      {hint && <span className="tl-field-hint">{hint}</span>}
      {children}
      {error && (
        <span className="tl-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
