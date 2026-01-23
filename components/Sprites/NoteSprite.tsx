"use client";
import { useEffect, useState } from "react";
import { Texture, Assets } from "pixi.js";
import type { ArrowDirection } from "./Arrow";

// Import note assets
import NoteLeft from "../Assets/notes/left.png";
import NoteUp from "../Assets/notes/up.png";
import NoteDown from "../Assets/notes/down.png";
import NoteRight from "../Assets/notes/right.png";

const noteAssets: Record<ArrowDirection, string> = {
    left: NoteLeft,
    up: NoteUp,
    down: NoteDown,
    right: NoteRight,
};

interface NoteSpriteProps {
    direction: ArrowDirection;
    x: number;
    y: number;
    scale?: number;
    alpha?: number;
    tint?: number;
}

export default function NoteSprite({ direction, x, y, scale = 1, alpha = 1, tint }: NoteSpriteProps) {
    const [texture, setTexture] = useState<Texture>(Texture.EMPTY);

    useEffect(() => {
        const loadTexture = async () => {
            const asset = noteAssets[direction];
            const loadedTexture = await Assets.load(asset);
            setTexture(loadedTexture);
        };

        if (texture === Texture.EMPTY) {
            loadTexture();
        }
    }, [direction, texture]);

    return (
        <pixiSprite
            texture={texture}
            x={x}
            y={y}
            anchor={0.5}
            scale={scale}
            alpha={alpha}
            tint={tint}
        />
    );
}
