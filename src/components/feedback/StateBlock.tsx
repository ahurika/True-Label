import React from 'react';

export interface StateBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  actions?: React.ReactNode;
  headingLevel?: 'h1' | 'h2';
}

export const StateBlock: React.FC<StateBlockProps> = ({
  icon,
  title,
  body,
  actions,
  headingLevel = 'h2',
  className = '',
  ...props
}) => {
  const HeadingTag = headingLevel;
  return (
    <div className={`tl-state-block ${className}`.trim()} {...props}>
      {icon && <div className="tl-state-block-icon">{icon}</div>}
      <HeadingTag className="tl-state-block-title">{title}</HeadingTag>
      {body && <p className="tl-state-block-body">{body}</p>}
      {actions && <div className="tl-mt-3">{actions}</div>}
    </div>
  );
};
