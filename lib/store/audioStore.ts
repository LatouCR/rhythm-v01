import { create } from 'zustand';

const DEFAULT_VOLUME = 70;

// Placeholder functions for future user settings integration
const getUserVolumeSettings = async (): Promise<number | null> => {
  // TODO: Implement API call to fetch user volume settings
  // For now, use localStorage as fallback
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

const saveUserVolumeSettings = async (volume: number): Promise<void> => {
  // TODO: Implement API call to save user volume settings
  // For now, use localStorage as fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem('rhythm-v01-volume', volume.toString());
  }
};

interface AudioStore {
  volume: number;
  isPlaying: boolean;
  currentTrack: string | null;
  audioElement: HTMLAudioElement | null;
  currentTime: number;
  duration: number;

  setVolume: (volume: number) => void;
  setAudioElement: (audio: HTMLAudioElement) => void;
  playTrack: (src: string) => void;
  togglePlayPause: () => void;
  initializeVolume: () => void;
  updateProgress: (currentTime: number, duration: number) => void;
  seekTo: (time: number) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  volume: DEFAULT_VOLUME,
  isPlaying: false,
  currentTrack: null,
  audioElement: null,
  currentTime: 0,
  duration: 0,

  initializeVolume: async () => {
    const userVolume = await getUserVolumeSettings();
    if (userVolume !== null) {
      set({ volume: userVolume });
      const { audioElement } = get();
      if (audioElement) {
        audioElement.volume = userVolume / 100;
      }
    }
  },

  setVolume: async (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    set({ volume: clampedVolume });

    await saveUserVolumeSettings(clampedVolume);

    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = clampedVolume / 100;
    }
  },

  setAudioElement: (audio: HTMLAudioElement) => {
    set({ audioElement: audio });
    const { volume } = get();
    audio.volume = volume / 100;

    // Set up progress tracking event listeners
    audio.addEventListener('timeupdate', () => {
      get().updateProgress(audio.currentTime, audio.duration);
    });

    audio.addEventListener('loadedmetadata', () => {
      set({ duration: audio.duration });
    });

    audio.addEventListener('ended', () => {
      set({ isPlaying: false, currentTime: 0 });
    });
  },

  playTrack: (src: string) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.src = src;
      audioElement.loop = true;
      audioElement.play().then(() => {
        set({ isPlaying: true, currentTrack: src });
      }).catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  },

  togglePlayPause: () => {
    const { audioElement, isPlaying } = get();
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
      } else {
        audioElement.play().then(() => {
          set({ isPlaying: true });
        }).catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    }
  },

  updateProgress: (currentTime: number, duration: number) => {
    set({ currentTime, duration });
  },

  seekTo: (time: number) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },
}));
