"use client";
import dynamic from "next/dynamic";
import bg from "@/public/bg.jpg"
import { useEffect, useRef } from "react";
import { useCanvasSize } from "@/lib/use/useCanvasSize";

const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

function BackgroundCanvas() {
    const canvasSize = useCanvasSize();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.src = bg.src;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
        }
    }, [canvasSize.width, canvasSize.height]);

    if (canvasSize.width === 0 || canvasSize.height === 0) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="relative"
        />
    )
}

export default function GamePage() {
    return (
        <div className="bg-menu-background w-screen h-screen flex items-center justify-center">
            <BackgroundCanvas />
            <GameCanvas />
        </div>
    )
}
