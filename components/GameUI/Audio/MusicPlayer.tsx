'use client';

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { SkipBack, SkipForward, PauseCircle, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useMusicPlayer } from "@/lib/use/useMusicPlayer";
import { cn } from "@/lib";

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}

const ControlButton = ({ onClick, disabled, children, ariaLabel }: ControlButtonProps) => (
  <button
    className="h-12 px-3 hover:opacity-80 hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const MusicPlayer = () => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    currentTrackData,
    isPlaying,
    isLoading,
    getAudioProgress,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    getFormattedCurrentTime,
    getFormattedDuration,
    tracks
  } = useMusicPlayer();

  const backgroundUrl = currentTrackData?.backgroundUrl || "/bg.jpg";
  const hasMultipleTracks = tracks.length > 1;
  const progress = getAudioProgress();
  const trackName = currentTrackData?.title || "No Track";
  const trackArtist = currentTrackData?.artist || "";

  return (
    <div
      className="pointer-events-auto relative max-w-180 w-full flex flex-col items-center justify-center overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mask-b-from-50% mask-radial-[48%_900%] mask-radial-from-80% -z-10 absolute top-0 left-0 w-full h-full">
        <Image
          src={backgroundUrl}
          alt={`${trackName} Background Image`}
          fill
          className="w-full h-full object-cover blur-out blur-xs"
        />
      </div>

      <div className="flex items-center gap-6 py-2">
        <ControlButton
          onClick={skipToPrevious}
          disabled={!hasMultipleTracks}
          ariaLabel="Previous track"
        >
          <SkipBack className="h-10 w-10 text-white" />
        </ControlButton>

        <ControlButton
          onClick={togglePlayPause}
          disabled={isLoading || !currentTrackData}
          ariaLabel={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseCircle className="h-12 w-12 text-white" />
          ) : (
            <PlayCircle className="h-12 w-12 text-white" />
          )}
        </ControlButton>

        <ControlButton
          onClick={skipToNext}
          disabled={!hasMultipleTracks}
          ariaLabel="Next track"
        >
          <SkipForward className="h-10 w-10 text-white" />
        </ControlButton>
      </div>

      {isHovered && (
        <div className="">
          <h3 className="text-white text-lg font-semibold truncate max-w-xs text-center">
            {trackName}
          </h3>
          <p className="text-white/80 text-sm truncate max-w-xs text-center">
            {trackArtist}
          </p>
        </div>
      )}

      <div
        className={cn(
          "w-full px-4 pb-2 transition-all duration-200 ease-out",
          isHovered ? "opacity-100 max-h-16" : "opacity-0 max-h-0 overflow-hidden"
        )}
      >
        <div className="flex justify-between text-xs text-white/80 mb-1.5 font-medium">
          <span>{getFormattedCurrentTime()}</span>
          <span>{getFormattedDuration()}</span>
        </div>

        <Progress
          data-testid="audio-progress-bar"
          value={progress}
          className="w-full h-1.5 bg-white/30 rounded-full"
          indicatorClassName="bg-white rounded-full"
        />
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 w-full h-0.5 bg-white/20 transition-opacity duration-200",
          isHovered ? "opacity-0" : "opacity-100"
        )}
      >
        <div
          className="h-full bg-white/70 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
