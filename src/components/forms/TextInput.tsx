import React from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ hasError = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`tl-input ${hasError ? 'error' : ''} ${className}`.trim()}
        aria-invalid={hasError ? true : undefined}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
