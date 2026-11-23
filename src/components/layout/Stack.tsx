import React from 'react';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'tight' | 'default' | 'loose';
}

export const Stack: React.FC<StackProps> = ({
  gap = 'default',
  className = '',
  children,
  ...props
}) => {
  const gapClass = {
    tight: 'tl-stack-tight',
    default: 'tl-stack',
    loose: 'tl-stack-loose',
  }[gap];

  return (
    <div className={`${gapClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
