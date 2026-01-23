"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export interface CanvasSize {
    width: number;
    height: number;
}

export interface CanvasLayoutConfig {
    laneWidth: number;
    laneCount: number;
    lanesStartX: number;
    targetY: number;
    isMobile: boolean;
}

const MOBILE_BREAKPOINT = 1000;
const LANE_COUNT = 4;
const DESKTOP_LANE_WIDTH = 200;
const MOBILE_LANE_MIN_WIDTH = 80;
const TARGET_Y_OFFSET = 200;

export function useCanvasSize(containerRef?: React.RefObject<HTMLElement | null>): CanvasSize {
    const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });

    const calculateSize = useCallback((): CanvasSize => {
        if (containerRef?.current) {
            return {
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            };
        }
        if (typeof window !== "undefined") {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        }
        return { width: 0, height: 0 };
    }, [containerRef]);

    useEffect(() => {
        const handleResize = () => {
            setSize(calculateSize());
        };

        // Initial size
        handleResize();

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
        };
    }, [calculateSize]);

    return size;
}

export function useCanvasLayout(canvasSize: CanvasSize): CanvasLayoutConfig {
    const isMobile = canvasSize.width < MOBILE_BREAKPOINT;
    const laneWidth = isMobile ? MOBILE_LANE_MIN_WIDTH : DESKTOP_LANE_WIDTH;
    const laneCount = LANE_COUNT;
    const lanesStartX = (canvasSize.width - laneWidth * laneCount) / 2;
    const targetY = canvasSize.height - TARGET_Y_OFFSET;

    return {
        laneWidth,
        laneCount,
        lanesStartX,
        targetY,
        isMobile,
    };
}
