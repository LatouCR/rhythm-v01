"use client";
import { Application, extend, useApplication } from "@pixi/react"
import { Container, Sprite, Graphics } from "pixi.js";
import { useState, useEffect } from "react";
import type { RgbaColor } from "@pixi/colord";
import ArrowSprite, { type ArrowDirection } from "@/components/Sprites/Arrow";
import NoteSprite from "@/components/Sprites/NoteSprite";
import { useInputHandler, type PressedState } from "@/lib/use/useInputHandler";
import { useCanvasSize, useCanvasLayout, type CanvasLayoutConfig } from "@/lib/use/useCanvasSize";
import { useGameEngine, type Note, type GameConfig } from "@/lib/game";

extend({ Container, Sprite, Graphics });

const directions: ArrowDirection[] = ["left", "up", "down", "right"];

// Tint colors for note states
const NOTE_TINTS: Record<string, number> = {
    default: 0xffffff, // white (no tint)
    hit: 0x00ff00, // green tint for hit
    missed: 0xff0000, // red tint for missed
};

function BackgroundController({ color }: { color: RgbaColor }) {
    const { app, isInitialised } = useApplication();

    useEffect(() => {
        if (isInitialised && app?.renderer) {
            app.renderer.background.color.setValue(color);
            app.renderer.background.color.setAlpha(color.a);
        }
    }, [app, color, isInitialised]);

    return null;
}

interface NoteRendererProps {
    note: Note;
    layout: CanvasLayoutConfig;
    currentTime: number;
    config: GameConfig;
}

function NoteRenderer({ note, layout, currentTime, config }: NoteRendererProps) {
    const { laneWidth, lanesStartX, targetY } = layout;

    // Calculate Y position based on timing
    // timeOffset: negative = note is coming (above hit line), positive = note passed (below hit line)
    const timeOffset = currentTime - note.startTime;

    // Y position: targetY when timeOffset = 0
    // Notes fall from top (y = 0) to hit line (y = targetY)
    // scrollSpeed is pixels per ms
    const y = targetY + (timeOffset * config.scrollSpeed);

    // Calculate X position (center of lane)
    const x = lanesStartX + (note.lane * laneWidth) + (laneWidth / 2);

    // Determine tint and alpha based on note state
    let tint = NOTE_TINTS.default;
    let alpha = 1;

    if (note.isHit) {
        tint = NOTE_TINTS.hit;
        alpha = 0.5;
    } else if (note.isMissed) {
        tint = NOTE_TINTS.missed;
        alpha = 0.5;
    }

    return (
        <NoteSprite
            direction={note.direction}
            x={x}
            y={y}
            scale={layout.isMobile ? 0.4 : 0.7}
            alpha={alpha}
            tint={tint}
        />
    );
}

interface PlayAreaProps {
    pressed: PressedState;
    showLines?: boolean;
    layout: CanvasLayoutConfig;
    canvasHeight: number;
    laneOverlayOpacity: number;
    visibleNotes: Note[];
    currentTime: number;
    config: GameConfig;
}

function PlayArea({ pressed, showLines, layout, canvasHeight, laneOverlayOpacity, visibleNotes, currentTime, config }: PlayAreaProps) {
    const { laneWidth, laneCount, lanesStartX, targetY } = layout;
    const totalLaneWidth = laneWidth * laneCount;

    return (
        <pixiContainer>
            {/* Lane background overlay */}
            <pixiGraphics
                draw={(g) => {
                    g.clear();
                    g.rect(lanesStartX, 0, totalLaneWidth, canvasHeight);
                    g.fill({ color: 0x000000, alpha: laneOverlayOpacity });
                }}
            />

            {/* Lane separators */}
            {showLines && (
                <>
                    {Array.from({ length: laneCount + 1 }).map((_, i) => (
                        <pixiGraphics
                            key={`lane-${i}`}
                            draw={(g) => {
                                g.clear();
                                g.setStrokeStyle({ width: 2, color: 0x333333 });
                                g.moveTo(lanesStartX + i * laneWidth, 0);
                                g.lineTo(lanesStartX + i * laneWidth, canvasHeight);
                                g.stroke();
                            }}
                        />
                    ))}

                    {/* Target/Hit line */}
                    <pixiGraphics
                        draw={(g) => {
                            g.clear();
                            g.setStrokeStyle({ width: 3, color: 0xffffff });
                            g.moveTo(lanesStartX, targetY);
                            g.lineTo(lanesStartX + laneCount * laneWidth, targetY);
                            g.stroke();
                        }}
                    />
                </>
            )}

            {/* Render falling notes */}
            {visibleNotes.map((note) => (
                <NoteRenderer
                    key={note.id}
                    note={note}
                    layout={layout}
                    currentTime={currentTime}
                    config={config}
                />
            ))}

            {/* Arrow targets at the bottom of each lane */}
            {directions.map((direction, i) => (
                <ArrowSprite
                    key={direction}
                    direction={direction}
                    x={lanesStartX + i * laneWidth + 190}
                    y={targetY + 180}
                    pressed={pressed[direction]}
                    scale={layout.isMobile ? 0.5 : 0.9}
                />
            ))}
        </pixiContainer>
    );
}

export default function GameCanvas() {
    const canvasSize = useCanvasSize();
    const layout = useCanvasLayout(canvasSize);

    const [bgDim, setBGDim] = useState<RgbaColor>({ r: 0, g: 0, b: 0, a: 0.2 });
    const [laneOverlayOpacity, setLaneOverlayOpacity] = useState(0.2);
    const [showLines, setShowLines] = useState(true);
    const [scrollSpeed, setScrollSpeed] = useState(0.5); // pixels per ms
    const pressed = useInputHandler();

    // Initialize game engine with scroll speed config
    const {
        state: gameState,
        visibleNotes,
        config,
        currentTime,
        start,
        pause,
        resume,
        reset,
        loadTestPattern,
    } = useGameEngine({
        config: {
            scrollSpeed,
            // Approach time adjusts with scroll speed so notes appear at same screen position
            approachTime: Math.max(1000, layout.targetY / scrollSpeed),
        },
        onJudge: (event) => {
            console.log(`[UI] Judge: ${event.result} | Combo: ${event.combo} | Score: +${event.score}`);
        },
        onGameEnd: (finalState) => {
            console.log('[UI] Game ended!', finalState);
        },
    });

    // Load test pattern on mount
    useEffect(() => {
        loadTestPattern();
    }, [loadTestPattern]);

    const onToggleLines = () => {
        setShowLines((prev) => !prev);
    };

    const onStartGame = () => {
        if (gameState.isPlaying && !gameState.isPaused) {
            pause();
        } else if (gameState.isPaused) {
            resume();
        } else {
            start();
        }
    };

    const onResetGame = () => {
        reset();
        loadTestPattern();
    };

    // Don't render until we have valid dimensions
    if (canvasSize.width === 0 || canvasSize.height === 0) {
        return null;
    }

    return (
        <main className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none z-[100]">
            {/* Control Panel */}
            <div className="absolute top-4 left-4 pointer-events-auto bg-black/50 p-2 rounded-md flex flex-col gap-2 text-white z-10">
                <label className="text-xs">BG Dim</label>
                <input type="range" min="0" max="1" step="0.01" value={bgDim.a} onChange={(e) => setBGDim({ ...bgDim, a: parseFloat(e.target.value) })} />
                <label className="text-xs">Lane Overlay</label>
                <input type="range" min="0" max="1" step="0.01" value={laneOverlayOpacity} onChange={(e) => setLaneOverlayOpacity(parseFloat(e.target.value))} />
                <label className="text-xs">Scroll Speed: {scrollSpeed.toFixed(2)}</label>
                <input type="range" min="0.1" max="2" step="0.05" value={scrollSpeed} onChange={(e) => setScrollSpeed(parseFloat(e.target.value))} />
                <button onClick={onToggleLines} className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md">
                    {showLines ? 'Hide Lines' : 'Show Lines'}
                </button>
                <hr className="border-gray-600" />
                <button
                    onClick={onStartGame}
                    className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded-md"
                >
                    {gameState.isPlaying && !gameState.isPaused ? 'Pause' : gameState.isPaused ? 'Resume' : 'Start'}
                </button>
                <button
                    onClick={onResetGame}
                    className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded-md"
                >
                    Reset
                </button>
                <hr className="border-gray-600" />
                <div className="text-xs text-gray-400">Keys: D F J K</div>
            </div>

            {/* Game Stats */}
            <div className="absolute top-4 right-4 pointer-events-none bg-black/50 p-3 rounded-md text-white z-10 min-w-[150px]">
                <div className="text-xs font-bold mb-2">GAME STATS</div>
                <div className="text-xs">Score: {Math.round(gameState.score)}</div>
                <div className="text-xs">Combo: {gameState.combo}</div>
                <div className="text-xs">Max Combo: {gameState.maxCombo}</div>
                <div className="text-xs">Health: {gameState.health}%</div>
                <hr className="border-gray-600 my-2" />
                <div className="text-xs text-green-400">Perfect: {gameState.marks.perfect}</div>
                <div className="text-xs text-blue-400">Good: {gameState.marks.good}</div>
                <div className="text-xs text-yellow-400">Offbeat: {gameState.marks.offbeat}</div>
                <div className="text-xs text-red-400">Miss: {gameState.marks.miss}</div>
                <hr className="border-gray-600 my-2" />
                <div className="text-xs">Time: {(currentTime / 1000).toFixed(1)}s</div>
                <div className="text-xs">Notes: {visibleNotes.length}</div>
            </div>

            <Application
                width={canvasSize.width}
                height={canvasSize.height}
                backgroundAlpha={0}
                antialias
                resizeTo={typeof window !== "undefined" ? window : undefined}
            >
                <BackgroundController color={bgDim} />
                <PlayArea
                    pressed={pressed}
                    showLines={showLines}
                    layout={layout}
                    canvasHeight={canvasSize.height}
                    laneOverlayOpacity={laneOverlayOpacity}
                    visibleNotes={visibleNotes}
                    currentTime={currentTime}
                    config={config}
                />
            </Application>
        </main>
    );
}
