import React from 'react';

export interface CaveatProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

/**
 * Mandatory Copied-Number Caveat:
 * Every screen, card, or shared view displaying "Registered and matches"
 * must visibly, permanently, and non-dismissibly display this notice.
 */
export const Caveat: React.FC<CaveatProps> = ({
  text = 'A registered number can appear on a copied or counterfeit pack. This check compares available records and does not authenticate the physical contents or prove safety.',
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-caveat ${className}`.trim()} role="note" {...props}>
      {text}
    </div>
  );
};
