"use client";
import { motion } from 'motion/react';
import { Particles, StarBorder } from "@/components/ReactBits";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const PARTICLE_COLORS = ['#1f1e33', '#ffffff', '#5E548E'];
const PARTICLE_COUNT = 500;
const PARTICLE_SPREAD = 12;
const PARTICLE_SPEED = 0.5;
const PARTICLE_BASE_SIZE = 200;
const MOVE_PARTICLES_ON_HOVER = false;
const ALPHA_PARTICLES = false;

export function MainMenu() {
    const [isHovered, setIsHovered] = useState(false);

    const handleToggle = () => {
        setIsHovered(prev => !prev);
    };

    return (
        <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <Particles
                    particleColors={PARTICLE_COLORS}
                    particleCount={PARTICLE_COUNT}
                    particleSpread={PARTICLE_SPREAD}
                    speed={PARTICLE_SPEED}
                    particleBaseSize={PARTICLE_BASE_SIZE}
                    moveParticlesOnHover={MOVE_PARTICLES_ON_HOVER}
                    alphaParticles={ALPHA_PARTICLES}
                />
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
                <motion.div
                    className="relative flex flex-col items-center w-full max-w-xl cursor-pointer"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onTap={handleToggle}
                    onClick={handleToggle}
                >
                    <motion.div
                        className="relative w-full max-w-xs sm:max-w-sm md:max-w-xl aspect-video"
                        animate={{
                            y: isHovered ? -60 : 0,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 25
                        }}
                    >
                        <Image
                            src="/logo.svg"
                            alt="game-logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-center gap-4 w-full px-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            y: isHovered ? 0 : 20,
                        }}
                        transition={{
                            duration: 0.3,
                            ease: "easeOut"
                        }}
                    >
                        <motion.div className="w-full flex justify-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <StarBorder
                                className="[&>div]:px-8 [&>div]:py-3 cursor-pointer font-semibold text-lg w-full max-w-xs"
                                color="#5E548E"
                                thickness={2}
                                speed="4s"
                            >
                                <p className='hover:text-white text-white/80'>Start Game</p>
                            </StarBorder>
                        </motion.div>
                        <Link
                            href="/account"
                            className="text-white/80 hover:text-white transition-colors duration-200 text-base font-medium cursor-pointer"
                        >
                            Log In or Register
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}