'use client';

import React from 'react';
import { CheckIcon } from '../icons/CheckIcon';

export interface ConfirmButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  confirmed?: boolean;
  onConfirmChange?: (confirmed: boolean) => void;
  unconfirmedLabel?: string;
  confirmedLabel?: string;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  confirmed = false,
  onConfirmChange,
  unconfirmedLabel = 'This matches my pack',
  confirmedLabel = 'Number confirmed',
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onConfirmChange) {
      onConfirmChange(!confirmed);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={confirmed}
      aria-pressed={confirmed}
      className={`tl-confirm-btn ${confirmed ? 'confirmed' : ''} ${className}`.trim()}
      onClick={handleClick}
      {...props}
    >
      {confirmed ? (
        <CheckIcon size={16} />
      ) : (
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '1.5px solid currentColor',
          }}
          aria-hidden="true"
        />
      )}
      <span>{confirmed ? confirmedLabel : unconfirmedLabel}</span>
    </button>
  );
};
