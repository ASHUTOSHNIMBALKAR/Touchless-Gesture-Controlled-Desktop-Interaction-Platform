'use client';

import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { FilesetResolver, HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { useGestureStore } from '@/store/useGestureStore';

// Configuration
const WASM_URL = '/wasm'; // Path to local WASM folder in public
const MODEL_ASSET_PATH = '/models/hand_landmarker.task';

export default function HandTracker() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setConnected, updateCursor, setGesture } = useGestureStore();

    // Websocket Ref
    const ws = useRef<WebSocket | null>(null);
    const lastGesture = useRef<string>("none"); // 'pinch' or 'open'

    // Initialize WebSocket
    useEffect(() => {
        const connect = () => {
            ws.current = new WebSocket('ws://localhost:8000/ws');
            ws.current.onopen = () => {
                setConnected(true);
                // setStatus("System Ready");
            };
            ws.current.onclose = () => {
                setConnected(false);
                // setStatus("Disconnected - Retrying...");
                setTimeout(connect, 2000);
            };
            ws.current.onerror = () => {
                ws.current?.close();
            };
        };
        connect();
        return () => ws.current?.close();
    }, [setConnected]);

    // Initialize MediaPipe
    useEffect(() => {
        let handLandmarker: HandLandmarker | null = null;
        let animationFrameId: number;

        const setupMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(WASM_URL);
                handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: MODEL_ASSET_PATH,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                // setIsLoaded(true);
                startLoop();
            } catch (error) {
                console.error("Error initializing MediaPipe:", error);
                // setStatus("Error loading AI Model");
            }
        };

        setupMediaPipe();

        const startLoop = () => {
            if (videoRef.current && handLandmarker) {
                processVideo(handLandmarker);
            }
        };

        const processVideo = (landmarker: HandLandmarker) => {
            if (!videoRef.current || !canvasRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Ensure video is playing and has data
            if (video.readyState >= 2) {
                // Resize canvas to match video
                if (canvas.width !== video.videoWidth) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                const startTimeMs = performance.now();
                const results = landmarker.detectForVideo(video, startTimeMs);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (results.landmarks && results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0]; // First hand
                    drawHand(ctx, landmarks);
                    handleGestures(landmarks);
                }
            }
            animationFrameId = requestAnimationFrame(() => processVideo(landmarker));
        };

        return () => {
            cancelAnimationFrame(animationFrameId);
            handLandmarker?.close();
        };
    }, []);

    // Gesture Logic
    const handleGestures = (landmarks: NormalizedLandmark[]) => {
        // Landmarks
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];

        // Coordinates (Cursor follows Index Tip)
        const x = indexTip.x;
        const y = indexTip.y;

        // Invert X for mirroring effect
        const cursorX = 1 - x;
        const cursorY = y;

        updateCursor(cursorX, cursorY);

        // Calculate Distances
        const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        const pinchDist = getDistance(thumbTip, indexTip);
        const middlePinchDist = getDistance(thumbTip, middleTip);
        const ringPinchDist = getDistance(thumbTip, ringTip);

        const PINCH_THRESHOLD = 0.05;

        const isPinching = pinchDist < PINCH_THRESHOLD;
        const isMiddlePinching = middlePinchDist < PINCH_THRESHOLD;
        const isRingPinching = ringPinchDist < PINCH_THRESHOLD;

        let action = null;
        let currentG = "Hover";

        // Priority: Scroll > Right Click > Left Click > Move

        if (isMiddlePinching) {
            currentG = "Scroll Mode";
            // Calculate scroll amount based on vertical movement relative to center/previous
            // Simplified: use "Index" y position delta for scrolling
            // Or simpler: If hand is high -> scroll up, low -> scroll down? 
            // Better: Dynamic relative scroll.
            // Let's use specific delta if we tracked history, but for statelessness:
            // We can just rely on backend to not move mouse if we don't send "move".
            // To SCROLL, we need a standard inputs. 
            // Let's implement "Drag Up/Down" metaphor. 
            // If Middle Pinch is held, track Y movement.

            // However, we don't store previous Y here easily without ref.
            // Let's hack: Send "scroll" with 0 to just show state, 
            // BUT actually, let's use a "Virtual Joystick" approach or Delta approach.
            // Let's just use: "If Middle Pinch, movement of Index Tip = Scroll"
            // But we need 'lastY'. We can use a ref for scroll reference.
            // For now, simpler: Scroll Step.
            // If Index Tip is in top half of screen -> Scroll Up. Bottom half -> Scroll Down.
            // Speed proportional to distance from center.

            const scrollThreshold = 0.05;
            const centerY = 0.5;
            const dy = y - centerY;

            if (Math.abs(dy) > scrollThreshold) {
                // Speed factor
                const speed = Math.round(dy * -50); // Inverted: Y goes down (increases) -> Scroll Down (negative? No, usually WheelDown is negative)
                // Windows: Positive is UP, Negative is DOWN.
                // If y is large (bottom), dy is positive. We want to scroll DOWN (negative).
                // So: -dy.

                action = "scroll";
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        action: "scroll",
                        amount: speed
                    }));
                }
            }

        } else if (isRingPinching) {
            currentG = "Right Click";
            if (lastGesture.current !== "Right Click") {
                action = "right_click";
            }
        } else if (isPinching) {
            currentG = "Drag / Click";
            if (lastGesture.current !== "Drag / Click") {
                action = "mousedown";
            } else {
                action = "move"; // Dragging functionality often needs 'move' with mousedown held
            }
        } else {
            // Open Hand
            currentG = "Hover";
            if (lastGesture.current === "Drag / Click") {
                action = "mouseup";
            } else {
                action = "move";
            }
        }

        lastGesture.current = currentG;
        setGesture(currentG);

        // Send discrete actions
        if (action && action !== "scroll" && ws.current && ws.current.readyState === WebSocket.OPEN) { // Scroll is handled inside the if (continuous)
            // For "move", send coordinates
            const payload: any = { action: action };
            if (action === "move" || action === "mousedown") {
                payload.x = cursorX;
                payload.y = cursorY;
            }
            ws.current.send(JSON.stringify(payload));
        }
    };

    // Sci-Fi Drawing
    const drawHand = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[]) => {
        // Draw connections
        const connections = HandLandmarker.HAND_CONNECTIONS;
        ctx.save();
        ctx.strokeStyle = "#00F0FF"; // Cyan
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00F0FF";
        ctx.shadowBlur = 10;

        for (const conn of connections) {
            const start = landmarks[conn.start];
            const end = landmarks[conn.end];
            ctx.beginPath();
            ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
            ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
            ctx.stroke();
        }

        // Draw Landmarks
        ctx.fillStyle = "#FFFFFF";
        for (const lm of landmarks) {
            ctx.beginPath();
            ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Highlight Index
        const index = landmarks[8];
        ctx.fillStyle = "#FF0055"; // Pink
        ctx.beginPath();
        ctx.arc(index.x * ctx.canvas.width, index.y * ctx.canvas.height, 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    };

    // Start Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (e) {
                console.error("Camera error", e);
                // setStatus("Camera Error");
            }
        };
        startCamera();
    }, []);

    return (
        <div className="tracker-container">
            <video
                ref={videoRef}
                className="video-feed"
                playsInline
                muted
            />
            <canvas
                ref={canvasRef}
                className="canvas-feed"
            />
        </div>
    );
}
