import React from 'react';

export type StatusType = 'pending' | 'confirmed' | 'stale' | 'unavailable';

export interface StatusLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
}

export const StatusLabel: React.FC<StatusLabelProps> = ({
  status,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`tl-status-label ${className}`.trim()}
      data-status={status}
      {...props}
    >
      {children}
    </span>
  );
};
