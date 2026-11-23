import React from 'react';

export interface SegmentedControlProps {
  items: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  items,
  activeIndex,
  onChange,
  className = '',
}) => {
  return (
    <div className={`tl-segmented ${className}`.trim()} role="tablist">
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tl-segmented-item ${isActive ? 'active' : ''}`.trim()}
            onClick={() => onChange(index)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};
