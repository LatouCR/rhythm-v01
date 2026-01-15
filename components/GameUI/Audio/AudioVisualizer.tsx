import { useRef, useState, useEffect } from "react";
import Bars from "../Visualizer/Bars";
import type * as Tone from "tone";

const defaultDataArray = new Array(128).fill(0);

interface AudioVisualizerProps {
  analyser: Tone.Analyser | null;
}

export default function AudioVisualizer({ analyser }: AudioVisualizerProps) {
  const [dataArray, setDataArray] = useState<number[]>(defaultDataArray);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) return;

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);

      // Get FFT data from Tone.js analyser
      const values = analyser.getValue();

      if (values instanceof Float32Array) {
        // Convert from dB values (-100 to 0) to 0-255 range for visualization
        const normalized = Array.from(values).map(db => {
          // dB values typically range from -100 to 0
          const normalized = (db + 100) / 100;
          return Math.max(0, Math.min(255, normalized * 255));
        });
        setDataArray(normalized);
      }
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [analyser]);

  return (
    <div className="flex items-center justify-center w-full h-64 px-4">
      <Bars dataArray={dataArray} />
    </div>
  );
}