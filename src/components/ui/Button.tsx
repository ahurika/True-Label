import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const variantClass = {
    primary: 'tl-btn-primary',
    secondary: 'tl-btn-secondary',
    ghost: 'tl-btn-ghost',
  }[variant];

  const fullWidthClass = fullWidth ? 'tl-w-full' : '';
  const loadingClass = loading ? 'tl-btn-loading' : '';

  return (
    <button
      className={`tl-btn ${variantClass} ${fullWidthClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="tl-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} aria-hidden="true" />
          <span>Working…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
