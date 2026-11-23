import React from 'react';

export interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  subtext?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = 'Reading the pack',
  subtext = 'Comparing printed information…',
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-loading ${className}`.trim()} role="status" aria-live="polite" {...props}>
      <div className="tl-loading-spinner" aria-hidden="true" />
      <div className="tl-loading-text tl-title-3">{text}</div>
      {subtext && <div className="tl-caption tl-text-muted">{subtext}</div>}
    </div>
  );
};
