import { useRef, useState, useEffect } from "react";
import Bars from "../Visualizer/Bars";

const defaultDataArray = new Array(256).fill(0);

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
}

export default function AudioVisualizer({ audioElement }: AudioVisualizerProps) {
  const [dataArray, setDataArray] = useState<number[]>(defaultDataArray);

  const animationFrameIdRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    const initializeVisualizer = () => {
      if (audioCtxRef.current) return;

      audioCtxRef.current = new AudioContext();
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioElement);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      console.log('Analyser frequencyBinCount:', bufferLength);

      const draw = () => {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        analyserRef.current?.getByteFrequencyData(dataArray);
        setDataArray(Array.from(dataArray));
      };

      draw();
    };

    initializeVisualizer();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      audioCtxRef.current?.close();
    };
  }, [audioElement]);

  return (
    <div className="flex items-center justify-center w-full h-64 px-4">
      <Bars dataArray={dataArray} />
    </div>
  );
}