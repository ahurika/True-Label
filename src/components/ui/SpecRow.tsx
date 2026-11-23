import React from 'react';

export interface SpecRowProps extends React.HTMLAttributes<HTMLDivElement> {
  term: string;
  value: React.ReactNode;
}

export const SpecRow: React.FC<SpecRowProps> = ({
  term,
  value,
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-spec-row ${className}`.trim()} {...props}>
      <span className="tl-spec-row-term">{term}</span>
      <span className="tl-spec-row-value">{value}</span>
    </div>
  );
};
