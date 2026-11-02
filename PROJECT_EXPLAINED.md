# Touchless Control Project - Detailed Explanation

This project implements a **Touchless Computer Control System** that allows a user to control their mouse and perform actions (clicks, scrolling) using hand gestures captured by a webcam.

## 1. Project Architecture
The system is divided into two main parts:
1.  **Frontend (Next.js + MediaPipe)**: Captures video, detects hand landmarks in real-time, recognizes gestures, and sends commands via WebSockets.
2.  **Backend (FastAPI + PyAutoGUI)**: Receives commands via WebSockets and translates them into actual OS-level mouse and keyboard events.

---

## 2. Frontend Detail: `HandTracker.tsx`

The `HandTracker.tsx` component is the "brain" of the client side. It uses Google's **MediaPipe Tasks Vision** library for high-performance hand tracking.

### Key Sections:

#### A. Initialization & Setup
-   **MediaPipe Loader**: `setupMediaPipe()` loads the `hand_landmarker.task` model and WASM binaries. This runs on the GPU for maximum speed.
-   **Camera Access**: `startCamera()` uses `navigator.mediaDevices.getUserMedia` to stream 720p video from the webcam.
-   **WebSocket Connection**: A `useEffect` hook establishes a persistent connection to `ws://localhost:8000/ws` to stream gesture data to the backend.

#### B. The Processing Loop (`processVideo`)
Using `requestAnimationFrame`, the component continuously:
1.  Grabs a frame from the `<video>` element.
2.  Passes it to `landmarker.detectForVideo`.
3.  Receives a list of 21 hand landmarks (points in 3D space).
4.  Clears the `<canvas>` and draws a "Sci-Fi" skeleton over the hand for user feedback.

#### C. Gesture Recognition (`handleGestures`)
This is where mathematical logic turns points into actions:
-   **Cursor Movement**: The index finger tip (Landmark 8) is used as the cursor. The X-coordinate is inverted (`1 - x`) to create a mirroring effect, making it intuitive for the user.
-   **Distance Calculation**: Uses Euclidean distance between the thumb tip (Landmark 4) and other finger tips.
-   **Gestures**:
    -   **Pinch (Thumb + Index)**: Lowers distance below `0.05`. Triggers `mousedown` (left-click hold/drag).
    -   **Middle Pinch (Thumb + Middle)**: Triggers **Scroll Mode**. The vertical movement (`dy`) is calculated relative to the screen center to scroll up or down.
    -   **Ring Pinch (Thumb + Ring)**: Triggers `right_click`.
    -   **Open Hand**: Triggers `mouseup` and resumes standard `move` (hover).

#### D. State Management
The component updates a global store (`useGestureStore`) to show the current system status (Connected/Disconnected) and the active gesture (Hover, Drag, Scroll, etc.) on the UI.

---

## 3. Backend Detail: `server.py`

The backend is a lightweight Python server that acts as a bridge between the browser and the Operating System.

### Key Sections:

#### A. WebSocket Endpoint (`/ws`)
-   FastAPI handles the asynchronous WebSocket connection.
-   It waits for JSON messages from the frontend in a `while True` loop.

#### B. Command Translation (PyAutoGUI)
The server parses the `action` field from the JSON payload:
-   **`move`**: Takes normalized `x` and `y` (0.0 to 1.0) and multiplies them by the actual `screen_width` and `screen_height` (detected via `pyautogui.size()`).
-   **`mousedown` / `mouseup`**: Essential for drag-and-drop functionality.
-   **`click` / `right_click`**: Performs immediate button presses.
-   **`scroll`**: Receives an `amount` (calculated by the frontend) and scrolls the system wheel. Positive values scroll up, negative down.

#### C. Safety Features
-   `pyautogui.FAILSAFE = False`: Allows the cursor to reach the absolute edges of the screen, which is necessary for normalized coordinate mapping.
-   **Clamping**: Coordinates are clamped between 0 and 1 to prevent the mouse from trying to move "off-screen" and causing errors.

---

## 4. Full Execution Flow

1.  **Webcam Capture**: User moves their hand in front of the camera.
2.  **AI Detection**: MediaPipe identifies the index finger at $(0.7, 0.4)$.
3.  **Logic**: Frontend mirrors X to $0.3$ and detects the thumb is far from the index (no pinch).
4.  **Transmission**: Frontend sends `{"action": "move", "x": 0.3, "y": 0.4}` to the Python server.
5.  **Execution**: Python server sees the move command, calculates pixel coordinates (e.g., $1920 * 0.3 = 576$), and moves the OS cursor to that spot instantly.
6.  **Visuals**: The blue neon hand skeleton updates on the screen to show tracking is active.

This loop happens ~30-60 times per second, resulting in smooth, "touchless" control of the computer.
