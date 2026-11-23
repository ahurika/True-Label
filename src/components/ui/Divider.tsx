import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: 'default' | 'strong' | 'double-rule';
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClass = {
    default: 'tl-divider',
    strong: 'tl-divider-strong',
    'double-rule': 'tl-double-rule',
  }[variant];

  return <hr className={`${variantClass} ${className}`.trim()} {...props} />;
};
