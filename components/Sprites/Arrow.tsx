"use client";
import { useEffect, useState } from "react";
import { Texture, Assets } from "pixi.js";
import { arrowSets } from "./constants";

export type ArrowDirection = "left" | "up" | "down" | "right";

interface ArrowSpriteProps {
    direction: ArrowDirection;
    x: number;
    y: number;
    scale?: number;
    pressed?: boolean;
}

export default function ArrowSprite({ direction, x, y, scale = 1, pressed = false }: ArrowSpriteProps) {
    const [normalTexture, setNormalTexture] = useState<Texture>(Texture.EMPTY);
    const [pressedTexture, setPressedTexture] = useState<Texture>(Texture.EMPTY);

    useEffect(() => {
        const loadTextures = async () => {
            const assets = arrowSets[direction];
            const [normal, pressedText] = await Promise.all([
                Assets.load(assets.normal),
                Assets.load(assets.pressed),
            ]);
            setNormalTexture(normal);
            setPressedTexture(pressedText);
        };

        if (normalTexture === Texture.EMPTY) {
            loadTextures();
        }

    })
    
    const texture = pressed ? pressedTexture : normalTexture;

    return (
        <pixiSprite 
            texture={texture}
            x={x}
            y={y}
            anchor={1}
            scale={scale}
        />
    )


}