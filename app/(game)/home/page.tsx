"use client";
import { useEffect, useState } from "react";
import { AudioVisualizer } from "@/components/GameUI";
import { Settings, HomeIcon } from "lucide-react";
import MusicPlayer from "@/components/GameUI/Audio/MusicPlayer";
import { useMusicPlayer } from "@/lib/use/useMusicPlayer";
import { useAudioContext } from "@/lib/providers/AudioProvider";
import { TrackResponse, toMusicPlayerTrack } from "@/lib/types/TrackResponse";
import { MainMenu } from "./components/MainMenu";

export default function Home() {
  const { startAudio } = useAudioContext();
  const {
    player,
    analyser,
    initializePlayer,
    initializeVolume,
    setTracks,
    playTrackByIndex,
    currentTrackData
  } = useMusicPlayer();

  const [isLoading, setIsLoading] = useState(true);

  // Fetch tracks from API and store them
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/musicplayer",
          { cache: "force-cache" }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tracks");
        }
        const data: TrackResponse = await response.json();
        // Convert to MusicPlayerTrack format and store in global state
        const musicPlayerTracks = data.tracks.map(toMusicPlayerTrack);
        setTracks(musicPlayerTracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [setTracks]);

  // Initialize player and volume
  useEffect(() => {
    initializePlayer();
    initializeVolume();
  }, [initializePlayer, initializeVolume]);

  // Play the first track when tracks are loaded and player is ready
  // Only if no track is currently playing (e.g., from menu selection)
  useEffect(() => {
    if (!isLoading && player && !currentTrackData) {
      const handleFirstPlay = async () => {
        await startAudio();
        playTrackByIndex(0);
      };
      handleFirstPlay();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, player]);

  return (
    <main id="home-page" className="w-full h-screen">
      <div id="menu-header" className="w-full h-16 items-center justify-between px-2 flex bg-menu-background">
        <div className="flex items-center text-white">
          <div className="py-2 px-4 hover:bg-white/10 rounded-md cursor-pointer">
            <Settings size={28} />
          </div>
          <div className="py-2 px-4 hover:bg-white/10 rounded-md cursor-pointer">
            <HomeIcon size={28} />
          </div>
          <div>
            <span className="ml-2 text-lg font-medium">Home Page</span>
          </div>
        </div>
      </div>
      <MainMenu />
      <div className="absolute bottom-1 w-full flex flex-col justify-center items-center pointer-events-none">
        <div className="pointer-events-auto w-full border-b-2 border-[#1f1e33]">
          <AudioVisualizer analyser={analyser} />
        </div>
        <MusicPlayer />
      </div>
    </main>
  );
}
