import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`tl-page ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
