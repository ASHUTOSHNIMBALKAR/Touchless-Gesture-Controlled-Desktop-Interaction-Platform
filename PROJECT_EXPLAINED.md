# Project Explained

## What is this?
A touchless desktop control system using computer vision and hand gesture recognition.
The browser captures webcam feed, processes hand landmarks via MediaPipe, and sends
gesture commands over WebSocket to a local Python server that controls the OS cursor.

## Components

### Frontend (Next.js)
- Captures webcam video in-browser
- Runs MediaPipe HandLandmarker WASM model
- Classifies gestures from landmark positions
- Sends JSON commands via WebSocket

### Backend (FastAPI + PyAutoGUI)
- Receives WebSocket commands
- Maps commands to OS-level mouse/keyboard actions
- Applies EMA smoothing for stable cursor movement

## Why WebSocket?
Low-latency bidirectional communication ideal for real-time gesture streaming (~30fps).
