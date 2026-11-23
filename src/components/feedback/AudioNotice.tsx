import React from 'react';
import { SpeakerIcon } from '../icons/SpeakerIcon';

export interface AudioNoticeProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export const AudioNotice: React.FC<AudioNoticeProps> = ({
  message = 'Audio playback requires native-speaker sign-off per PRD v3.1 §13. Text display remains active.',
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-audio-notice ${className}`.trim()} role="note" {...props}>
      <SpeakerIcon size={20} className="tl-text-muted" style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
};
