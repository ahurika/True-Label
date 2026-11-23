import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <section className={`tl-section ${className}`.trim()} {...props}>
      {children}
    </section>
  );
};
