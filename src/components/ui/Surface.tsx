import React from 'react';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
}

export const Surface: React.FC<SurfaceProps> = ({
  raised = false,
  className = '',
  children,
  ...props
}) => {
  const surfaceClass = raised ? 'tl-surface-raised' : 'tl-surface';
  return (
    <div className={`${surfaceClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
