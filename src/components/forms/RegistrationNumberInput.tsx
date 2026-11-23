import React from 'react';

export interface RegistrationNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * RegistrationNumberInput displays prominent DM Sans bold text for registration numbers.
 * Formatted with monospace/tabular-nums alignment.
 */
export const RegistrationNumberInput = React.forwardRef<HTMLInputElement, RegistrationNumberInputProps>(
  ({ hasError = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        spellCheck={false}
        autoCapitalize="characters"
        autoComplete="off"
        className={`tl-reg-input ${hasError ? 'error' : ''} ${className}`.trim()}
        aria-invalid={hasError ? true : undefined}
        {...props}
      />
    );
  }
);

RegistrationNumberInput.displayName = 'RegistrationNumberInput';
