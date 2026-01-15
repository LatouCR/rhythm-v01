import { useAudioStore } from "@/lib/store/audioStore";
import { formatDuration } from "@/lib/utils/utils";

/*
    Custom hook to manage music player state and controls
    - Uses Tone.js Player via Zustand store
    - Calculate audio progress
    - Audio playback controls
    - Provides formatted duration strings
    - Track list management
*/

export function useMusicPlayer() {
    const {
        player,
        analyser,
        initializePlayer,
        initializeVolume,
        tracks,
        setTracks,
        playTrack,
        playTrackByIndex,
        skipToNext,
        skipToPrevious,
        togglePlayPause,
        currentTime,
        duration,
        isPlaying,
        isLoading,
        currentTrackData,
        currentTrackIndex,
        seekTo,
        volume,
        setVolume
    } = useAudioStore();

    const getAudioProgress = () => {
        if (!duration || duration === 0) return 0;
        return (currentTime / duration) * 100;
    };

    const getFormattedCurrentTime = () => formatDuration(currentTime);
    const getFormattedDuration = () => formatDuration(duration);

    return {
        // Player instance
        player,
        analyser,
        initializePlayer,
        initializeVolume,

        // Track list
        tracks,
        setTracks,
        currentTrackIndex,

        // Playback controls
        playTrack,
        playTrackByIndex,
        skipToNext,
        skipToPrevious,
        togglePlayPause,
        seekTo,

        // Progress
        getAudioProgress,
        currentTime,
        duration,
        getFormattedCurrentTime,
        getFormattedDuration,

        // State
        isPlaying,
        isLoading,

        // Current track info
        currentTrackData,

        // Volume
        volume,
        setVolume
    };
}
