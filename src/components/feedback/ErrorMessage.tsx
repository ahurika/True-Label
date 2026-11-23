import React from 'react';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-error-message ${className}`.trim()} role="alert" {...props}>
      <span className="tl-error-message-text">{message}</span>
    </div>
  );
};
