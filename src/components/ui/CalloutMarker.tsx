import React from 'react';

export interface CalloutMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  number: number | string;
}

export const CalloutMarker: React.FC<CalloutMarkerProps> = ({
  number,
  className = '',
  ...props
}) => {
  return (
    <span className={`tl-callout-marker ${className}`.trim()} aria-hidden="true" {...props}>
      {number}
    </span>
  );
};
