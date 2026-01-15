"use client"

import { useState, WheelEvent, useRef, useEffect } from "react"
import { VolumeX, Volume, Volume1, Volume2 } from "lucide-react"
import { motion, useMotionValue, animate } from "motion/react"
import { VerticalSlider } from "@/components/ReactBits"

import { useAudioStore } from "@/lib/store/audioStore"

export default function SoundController() {
    const { volume, setVolume } = useAudioStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(70);
    const containerRef = useRef<HTMLDivElement>(null);
    const scale = useMotionValue(1);

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY);
        const newVolume = volume - delta * 5;
        setVolume(newVolume);
        if (isMuted && newVolume > 0) {
            setIsMuted(false);
        }
    }

    const handleIconClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPinned(!isPinned);
        setIsOpen(!isPinned);
    };

    const handleMuteToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMuted) {
            setVolume(previousVolume);
            setIsMuted(false);
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleMouseEnter = () => {
        if (!isPinned) {
            setIsOpen(true);
            animate(scale, 1.05);
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned) {
            setIsOpen(false);
            animate(scale, 1);
        }
    };

    const Icon = isMuted ? VolumeX : volume === 0 ? Volume : volume < 50 ? Volume1 : Volume2;


    // Handle clicks outside when pinned
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isPinned && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsPinned(false);
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPinned]);

    const showSlider = isOpen || isPinned;

    return (
        <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex flex-col items-center"
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                    opacity: showSlider ? 1 : 0,
                    y: showSlider ? 0 : 10,
                    transition: { duration: 0.2 }
                }}
                className="absolute bottom-full mb-2 z-20"
                style={{ pointerEvents: showSlider ? 'auto' : 'none' }}
            >
                <div className="flex flex-col items-center gap-2 py-3 px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300 font-medium">{Math.round(volume)}</span>
                        <button
                            onClick={handleMuteToggle}
                            className="text-gray-400 hover:text-white transition-colors"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                    </div>
                    <VerticalSlider
                        value={isMuted ? 0 : volume}
                        onChange={(val) => {
                            setVolume(val);
                            if (isMuted && val > 0) {
                                setIsMuted(false);
                            }
                        }}
                        min={0}
                        max={100}
                        height={80}
                    />
                </div>
            </motion.div>

            <div className="py-2 px-3 text-white hover:bg-white/10 rounded-md cursor-pointer relative">
                <motion.div
                    onClick={handleIconClick}
                    onDoubleClick={handleMuteToggle}
                    style={{ scale }}
                    className="z-10"
                >
                    <Icon />
                </motion.div>
            </div>
        </div>
    )
}