import React from 'react';

export interface CheckRowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: React.ReactNode;
  value?: React.ReactNode;
}

export const CheckRow: React.FC<CheckRowProps> = ({
  icon,
  label,
  value,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`tl-check-row ${className}`.trim()} {...props}>
      {icon && <div className="tl-check-row-icon">{icon}</div>}
      <div className="tl-check-row-content">
        <div className="tl-check-row-label">{label}</div>
        {value && <div className="tl-check-row-value">{value}</div>}
        {children}
      </div>
    </div>
  );
};
