'use client';

import React, { useEffect } from 'react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="tl-scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="tl-bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Sheet'}
      >
        <div className="tl-bottom-sheet-grabber" aria-hidden="true" />
        {title && <h2 className="tl-title-3 tl-mb-2">{title}</h2>}
        {children}
      </div>
    </>
  );
};
