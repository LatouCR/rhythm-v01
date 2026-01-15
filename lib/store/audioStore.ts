import { create } from 'zustand';
import * as Tone from 'tone';
import type { MusicPlayerTrack } from '@/lib/types/TrackResponse';

const DEFAULT_VOLUME = 70;

// Volume persistence utilities
const getStoredVolume = (): number | null => {
  if (typeof window !== 'undefined') {
    const storedVolume = localStorage.getItem('rhythm-v01-volume');
    if (storedVolume) {
      const parsedVolume = parseInt(storedVolume, 10);
      if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 100) {
        return parsedVolume;
      }
    }
  }
  return null;
};

const saveStoredVolume = (volume: number): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rhythm-v01-volume', volume.toString());
  }
};

// Convert linear volume (0-100) to decibels for Tone.js
const volumeToDb = (volume: number): number => {
  if (volume === 0) return -Infinity;
  // Map 0-100 to -40db to 0db range
  return (volume / 100) * 40 - 40;
};

interface AudioStore {
  volume: number;
  isPlaying: boolean;
  currentTrackData: MusicPlayerTrack | null;
  currentTrackIndex: number;
  tracks: MusicPlayerTrack[];
  player: Tone.Player | null;
  analyser: Tone.Analyser | null;
  currentTime: number;
  duration: number;
  isLoading: boolean;

  setVolume: (volume: number) => void;
  initializePlayer: () => void;
  setTracks: (tracks: MusicPlayerTrack[]) => void;
  playTrack: (track: MusicPlayerTrack) => void;
  playTrackByIndex: (index: number) => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  togglePlayPause: () => void;
  initializeVolume: () => void;
  seekTo: (time: number) => void;
  dispose: () => void;
}

// Progress tracking state (outside store to avoid re-renders)
let progressInterval: ReturnType<typeof setInterval> | null = null;
let playbackStartTime: number = 0;
let playbackStartOffset: number = 0;

// Track loading state to handle rapid switches
let currentLoadId = 0;

const startProgressTracking = (
  player: Tone.Player,
  startOffset: number,
  set: (state: Partial<AudioStore>) => void
) => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  playbackStartTime = Tone.now();
  playbackStartOffset = startOffset;

  progressInterval = setInterval(() => {
    if (player.state === 'started' && player.buffer) {
      const elapsed = Tone.now() - playbackStartTime;
      const duration = player.buffer.duration;
      // Handle looping
      const currentTime = (playbackStartOffset + elapsed) % duration;

      set({
        currentTime,
        duration,
      });
    }
  }, 250); // Update 4 times per second
};

const stopProgressTracking = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  volume: DEFAULT_VOLUME,
  isPlaying: false,
  currentTrackData: null,
  currentTrackIndex: -1,
  tracks: [],
  player: null,
  analyser: null,
  currentTime: 0,
  duration: 0,
  isLoading: false,

  initializeVolume: () => {
    const storedVolume = getStoredVolume();
    if (storedVolume !== null) {
      set({ volume: storedVolume });
      const { player } = get();
      if (player) {
        player.volume.value = volumeToDb(storedVolume);
      }
    }
  },

  initializePlayer: () => {
    const { player, volume } = get();

    // Don't reinitialize if player already exists
    if (player) return;

    // Create analyser for visualization (256 FFT size = 128 frequency bins)
    const newAnalyser = new Tone.Analyser('fft', 256);

    const newPlayer = new Tone.Player({
      onload: () => {
        set({
          isLoading: false,
          duration: newPlayer.buffer.duration
        });
      },
    });

    // Connect: Player -> Analyser -> Destination
    newPlayer.connect(newAnalyser);
    newAnalyser.toDestination();

    newPlayer.volume.value = volumeToDb(volume);

    set({ player: newPlayer, analyser: newAnalyser });
  },

  setVolume: (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    set({ volume: clampedVolume });

    saveStoredVolume(clampedVolume);

    const { player } = get();
    if (player) {
      player.volume.value = volumeToDb(clampedVolume);
    }
  },

  setTracks: (tracks: MusicPlayerTrack[]) => {
    set({ tracks });
  },

  playTrack: async (track: MusicPlayerTrack) => {
    const { player, analyser, currentTrackData, volume, tracks } = get();

    // If same track, just toggle play/pause
    if (currentTrackData?.id === track.id && player) {
      get().togglePlayPause();
      return;
    }

    // Increment load ID to invalidate any pending loads
    const loadId = ++currentLoadId;

    set({ isLoading: true });

    // Create player and analyser if they don't exist
    let activePlayer = player;
    let activeAnalyser = analyser;
    if (!activePlayer) {
      activeAnalyser = new Tone.Analyser('fft', 256);
      activePlayer = new Tone.Player();
      activePlayer.connect(activeAnalyser);
      activeAnalyser.toDestination();
      activePlayer.volume.value = volumeToDb(volume);
      set({ player: activePlayer, analyser: activeAnalyser });
    }

    // Stop current playback and progress tracking
    stopProgressTracking();
    if (activePlayer.state === 'started') {
      activePlayer.stop();
    }

    // Find track index
    const trackIndex = tracks.findIndex(t => t.id === track.id);

    try {
      // Load new track
      await activePlayer.load(track.audioUrl);

      // Check if this load is still valid (user hasn't switched to another track)
      if (loadId !== currentLoadId) {
        return;
      }

      // Calculate start time from previewTime (convert ms to seconds)
      const duration = activePlayer.buffer.duration;
      const previewTimeSec = track.previewTime ? track.previewTime / 1000 : 0;
      const startTime = Math.min(Math.max(0, previewTimeSec), duration);

      activePlayer.loop = true;
      activePlayer.start(undefined, startTime);

      set({
        isPlaying: true,
        currentTrackData: track,
        currentTrackIndex: trackIndex,
        isLoading: false,
        duration,
        currentTime: startTime,
      });

      startProgressTracking(activePlayer, startTime, set);
    } catch (error) {
      // Only log error if this load is still relevant
      if (loadId === currentLoadId) {
        console.error('Error loading audio:', error);
        set({ isLoading: false });
      }
    }
  },

  playTrackByIndex: (index: number) => {
    const { tracks } = get();
    if (index >= 0 && index < tracks.length) {
      get().playTrack(tracks[index]);
    }
  },

  skipToNext: () => {
    const { currentTrackIndex, tracks } = get();
    if (tracks.length === 0) return;

    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    get().playTrackByIndex(nextIndex);
  },

  skipToPrevious: () => {
    const { currentTrackIndex, tracks } = get();
    if (tracks.length === 0) return;

    const prevIndex = currentTrackIndex <= 0 ? tracks.length - 1 : currentTrackIndex - 1;
    get().playTrackByIndex(prevIndex);
  },

  togglePlayPause: () => {
    const { player, isPlaying, currentTime } = get();

    if (!player || !player.loaded) return;

    if (isPlaying) {
      player.stop();
      stopProgressTracking();
      set({ isPlaying: false });
    } else {
      player.start(undefined, currentTime);
      startProgressTracking(player, currentTime, set);
      set({ isPlaying: true });
    }
  },

  seekTo: (time: number) => {
    const { player, isPlaying } = get();

    if (!player || !player.loaded) return;

    const clampedTime = Math.max(0, Math.min(time, player.buffer.duration));

    if (isPlaying) {
      player.stop();
      player.start(undefined, clampedTime);
    }

    set({ currentTime: clampedTime });
  },

  dispose: () => {
    const { player, analyser } = get();
    stopProgressTracking();

    if (player) {
      player.stop();
      player.dispose();
    }

    if (analyser) {
      analyser.dispose();
    }

    set({
      player: null,
      analyser: null,
      isPlaying: false,
      currentTrackData: null,
      currentTime: 0,
      duration: 0,
    });
  },
}));
