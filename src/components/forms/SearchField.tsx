import React from 'react';

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (term: string) => void;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div className={`tl-search ${className}`.trim()}>
        <svg
          className="tl-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input ref={ref} type="search" className="tl-search-input" {...props} />
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';
