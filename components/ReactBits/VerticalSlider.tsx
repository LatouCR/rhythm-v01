import React, { useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';

interface VerticalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  height?: number;
  className?: string;
}

const VerticalSlider: React.FC<VerticalSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  height = 80,
  className = ''
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const scale = useMotionValue(1);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValueFromPointer(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    animate(scale, 1.1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateValueFromPointer(e);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    animate(scale, 1);
  };

  const updateValueFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = 100 - Math.max(0, Math.min(100, (y / rect.height) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      onChange(Math.round(newValue));
    }
  };

  const getPercentage = (): number => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative bg-gray-600/50 rounded-full cursor-pointer touch-none w-2"
        style={{ height: `${height}px` }}
      >
        <motion.div
          className="absolute bottom-0 w-full bg-linear-to-t from-blue-500 to-purple-500 rounded-full"
          style={{
            height: `${getPercentage()}%`,
          }}
          animate={{
            opacity: isDragging ? 0.9 : 1,
          }}
        />
        <motion.div
          className="absolute w-4 h-4 bg-white rounded-full shadow-lg -left-1 pointer-events-none"
          style={{
            bottom: `calc(${getPercentage()}% - 14px)`,
            scale
          }}
          animate={{
            boxShadow: isDragging
              ? '0 4px 12px rgba(139, 92, 246, 0.5)'
              : '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>
    </div>
  );
};

export default VerticalSlider;
