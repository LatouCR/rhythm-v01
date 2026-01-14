import { useAudioStore } from "@/lib/store/audioStore";

export interface MusicPlayerProps { 
    getAudioProgress: () => number;
    togglePlayPause?: () => void;
    skipToNextTrack?: () => void;
    skipToPreviousTrack?: () => void;
}

// Fetch from database
// - Background Image
// - Process Metadata
// - Track List

/*
    Custom hook to manage music player state and controls
    - View Current and List Audio Elements
    - Calculate audio progress
    - Audio playback controls
*/

export function useMusicPlayer() {
    const { audioElement, setAudioElement, playTrack, togglePlayPause, currentTime, duration } = useAudioStore();

    const getAudioProgress = () => {
        if (!duration || duration === 0) return 0;
        return (currentTime / duration) * 100;
    }

    // Get Current Audio Element and Controls

    return {
        audioElement,
        setAudioElement,
        playTrack,
        togglePlayPause,
        getAudioProgress
    }

}

