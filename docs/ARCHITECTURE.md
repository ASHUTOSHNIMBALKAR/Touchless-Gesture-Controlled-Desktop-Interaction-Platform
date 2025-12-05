# Architecture

## Overview
- Frontend: Next.js + MediaPipe (browser-based hand tracking)
- Backend: FastAPI + PyAutoGUI (desktop control via WebSocket)

## Data Flow
Browser Camera -> MediaPipe -> Landmark Coords -> WebSocket -> FastAPI -> PyAutoGUI -> OS
