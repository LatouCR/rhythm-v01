"use client";
import { useState, useEffect, useCallback } from "react";
import type { ArrowDirection } from "@/components/Sprites/Arrow";

// Default key bindings: D, F, J, K for left, up, down, right
const DEFAULT_KEY_BINDINGS: Record<string, ArrowDirection> = {
    d: "left",
    f: "up",
    j: "down",
    k: "right",
};

export type PressedState = Record<ArrowDirection, boolean>;

export function useInputHandler(keyBindings = DEFAULT_KEY_BINDINGS) {
    const [pressed, setPressed] = useState<PressedState>({
        left: false,
        up: false,
        down: false,
        right: false,
    });

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        const direction = keyBindings[key];
        if (direction && !e.repeat) {
            setPressed((prev) => ({ ...prev, [direction]: true }));
        }
    }, [keyBindings]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        const direction = keyBindings[key];
        if (direction) {
            setPressed((prev) => ({ ...prev, [direction]: false }));
        }
    }, [keyBindings]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    return pressed;
}
