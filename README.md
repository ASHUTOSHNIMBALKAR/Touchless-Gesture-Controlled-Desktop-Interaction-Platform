# Touchless Gesture Controlled Desktop Interaction Platform

Control your desktop using hand gestures - no mouse or keyboard needed.

## Tech Stack
- Frontend: Next.js 14, TypeScript, MediaPipe Hand Landmarker
- Backend: FastAPI, PyAutoGUI, WebSocket

## Setup

### Backend
pip install -r backend/requirements.txt
python backend/server.py

### Frontend
cd frontend
npm install
npm run dev

## Gestures
| Gesture | Action |
|---------|--------|
| Index finger up | Move cursor |
| Pinch (thumb + index) | Left click |
| Fist | Right click |
| Two fingers | Scroll |
