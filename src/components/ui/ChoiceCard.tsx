import React from 'react';

export interface ChoiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  selected = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      className={`tl-choice-card ${selected ? 'selected' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
