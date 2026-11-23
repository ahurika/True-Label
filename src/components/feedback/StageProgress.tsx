import React from 'react';

export type StageState = 'pending' | 'current' | 'done';

export interface StageItem {
  id: string;
  label: string;
  state: StageState;
}

export interface StageProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  stages: StageItem[];
}

export const StageProgress: React.FC<StageProgressProps> = ({
  stages,
  className = '',
  ...props
}) => {
  return (
    <div className={`tl-stack-tight ${className}`.trim()} {...props}>
      {stages.map((stage) => {
        const stateSymbol = {
          pending: '○',
          current: '◐',
          done: '●',
        }[stage.state];

        return (
          <div key={stage.id} className="tl-stage-item" data-state={stage.state}>
            <span aria-hidden="true">{stateSymbol}</span>
            <span>{stage.label}</span>
          </div>
        );
      })}
    </div>
  );
};
