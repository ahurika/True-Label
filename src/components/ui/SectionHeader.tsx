import React from 'react';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h2 className={`tl-section-header ${className}`.trim()} {...props}>
      {children}
    </h2>
  );
};
