import { Progress } from "@/components/ui/progress";
import { SkipBack, SkipForward, PauseCircle, LibraryBig } from "lucide-react";

interface MusicPlayerProps {
  getAudioProgress: () => number;
  togglePlayPause?: () => void;
  toggleLibrary?: () => void;
  skipToNextTrack?: () => void;
  skipToPreviousTrack?: () => void;
}

const MusicPlayer = ({
  getAudioProgress,
  togglePlayPause,
  toggleLibrary,
  skipToNextTrack,
  skipToPreviousTrack
}: MusicPlayerProps) => {

  return (
    <div className="pointer-events-auto relative max-w-150 w-full flex flex-col items-center justify-center overflow-hidden">
      <img src="./bg.jpg" alt="current-song-bg" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-100 -z-10 object-cover" />
      <div className="flex items-center gap-16">
        <button className="h-16 px-4">
          <SkipBack color="white" className="h-14 w-14" />
        </button>
        <button className="h-16 px-4">
          <PauseCircle color="white" className="h-14 w-14" onClick={togglePlayPause} />
        </button>
        <button className="h-16 px-4">
          <SkipForward color="white" className="h-14 w-14" />
        </button>
      </div>
      <Progress
        data-testid="audio-progress-bar"
        value={getAudioProgress()}
        className="w-full h-1 mt-2 bg-gray-600/30 progress-bar-transition"
      />
    </div>
  )
}

export default MusicPlayer