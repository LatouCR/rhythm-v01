"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, type GameEngineCallbacks } from './GameEngine';
import type { GameState, GameConfig, GameBeatmap } from './types';
import { INITIAL_GAME_STATE, DEFAULT_GAME_CONFIG } from './types';
import type { Note } from './Note';
import type { JudgeEvent } from './Judge';
import type { ArrowDirection } from '@/components/Sprites/Arrow';

// Key bindings for directions (D F J K layout)
const KEY_BINDINGS: Record<string, ArrowDirection> = {
    d: 'left',
    f: 'up',
    j: 'down',
    k: 'right',
};

export interface UseGameEngineOptions {
    config?: Partial<GameConfig>;
    onJudge?: (event: JudgeEvent) => void;
    onGameEnd?: (state: GameState) => void;
}

export interface UseGameEngineReturn {
    // State
    state: GameState;
    visibleNotes: Note[];
    config: GameConfig;
    currentTime: number;

    // Controls
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    reset: () => void;

    // Loading
    loadBeatmap: (beatmap: GameBeatmap) => void;
    loadTestPattern: () => void;
}

export function useGameEngine(options: UseGameEngineOptions = {}): UseGameEngineReturn {
    const { config: userConfig, onJudge, onGameEnd } = options;

    const engineRef = useRef<GameEngine | null>(null);
    const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
    const [visibleNotes, setVisibleNotes] = useState<Note[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);

    // Store callbacks in refs to avoid re-creating engine
    const onJudgeRef = useRef(onJudge);
    const onGameEndRef = useRef(onGameEnd);

    useEffect(() => {
        onJudgeRef.current = onJudge;
    }, [onJudge]);

    useEffect(() => {
        onGameEndRef.current = onGameEnd;
    }, [onGameEnd]);

    // Initialize engine once
    useEffect(() => {
        const callbacks: GameEngineCallbacks = {
            onStateChange: setState,
            onJudge: (event) => onJudgeRef.current?.(event),
            onGameEnd: (state) => onGameEndRef.current?.(state),
        };

        engineRef.current = new GameEngine(userConfig, callbacks);
        setConfig(engineRef.current.getConfig());

        return () => {
            engineRef.current?.destroy();
            engineRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only initialize once - userConfig is handled in separate effect

    // Update config when it changes
    useEffect(() => {
        if (engineRef.current && userConfig) {
            engineRef.current.updateConfig(userConfig);
            setConfig(engineRef.current.getConfig());
        }
    }, [userConfig]);

    // Update visible notes at 60fps
    useEffect(() => {
        let frameId: number;

        const update = () => {
            if (engineRef.current) {
                setVisibleNotes(engineRef.current.getVisibleNotes());
                setCurrentTime(engineRef.current.getCurrentTime());
            }
            frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(frameId);
    }, []);

    // Keyboard event handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const direction = KEY_BINDINGS[e.key.toLowerCase()];
            if (direction && !e.repeat && engineRef.current) {
                engineRef.current.onKeyDown(direction);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const direction = KEY_BINDINGS[e.key.toLowerCase()];
            if (direction && engineRef.current) {
                engineRef.current.onKeyUp(direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Control functions
    const start = useCallback(() => engineRef.current?.start(), []);
    const pause = useCallback(() => engineRef.current?.pause(), []);
    const resume = useCallback(() => engineRef.current?.resume(), []);
    const stop = useCallback(() => engineRef.current?.stop(), []);
    const reset = useCallback(() => engineRef.current?.reset(), []);

    const loadBeatmap = useCallback((beatmap: GameBeatmap) => {
        engineRef.current?.loadBeatmap(beatmap);
    }, []);

    const loadTestPattern = useCallback(() => {
        engineRef.current?.loadTestPattern();
    }, []);

    return {
        state,
        visibleNotes,
        config,
        currentTime,
        start,
        pause,
        resume,
        stop,
        reset,
        loadBeatmap,
        loadTestPattern,
    };
}
