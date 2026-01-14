"use client";
import { useEffect, useState } from "react";;
import { AudioVisualizer } from "@/components/GameUI";
import { MainMenu } from "./components/MainMenu";
import { Settings, HomeIcon } from "lucide-react";
import { useAudioStore } from "@/lib/store/audioStore";
import MusicPlayer from "@/components/GameUI/Audio/MusicPlayer";

export default function Home() {
  const { audioElement, setAudioElement, playTrack, initializeVolume, togglePlayPause, currentTime, duration } = useAudioStore();

  const getAudioProgress = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  useEffect(() => {
    // Create and set up audio element
    const audio = new Audio();
    setAudioElement(audio);

    // Get Audio Duration when metadata is loaded

    // Initialize volume from storage
    initializeVolume();

    // Play the background track
    playTrack("/livefast.mp3");

    // Cleanup
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [setAudioElement, playTrack, initializeVolume]);

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
              <MusicPlayer getAudioProgress={getAudioProgress} togglePlayPause={togglePlayPause} />
      <div className="absolute bottom-4 w-full flex flex-col justify-center items-center pointer-events-none">
        <div className="pointer-events-auto w-full border-b-2 border-[#1f1e33]">
          <AudioVisualizer audioElement={audioElement} />
        </div>
      </div>
    </main>
  );
}
