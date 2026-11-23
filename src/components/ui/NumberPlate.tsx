import React from 'react';

export interface NumberPlateProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label?: string;
}

/**
 * NumberPlate component represents The Plate in The Register visual language.
 * The double rule frames a printed registration number.
 * It is NOT a seal or certificate.
 */
export const NumberPlate: React.FC<NumberPlateProps> = ({
  value,
  label = 'Registration number',
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-number-plate ${className}`.trim()} {...props}>
      <span className="tl-number-plate-label">{label}</span>
      <span className="tl-number-plate-value">{value}</span>
    </div>
  );
};
