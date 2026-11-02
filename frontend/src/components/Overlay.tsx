'use client';
import { useGestureStore } from '@/store/useGestureStore';

export default function Overlay() {
    const { gesture, isConnected } = useGestureStore();

    return (
        <div className="overlay-container absolute top-0 left-0 w-full h-full p-8 flex flex-col justify-between z-50">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="hud-title">GESTURE GRID</h1>
                    <p className="hud-subtitle">STERILE INTERFACE SYSTEM</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-2 ${isConnected ? 'text-green' : 'text-red'}`}>
                        <div
                            className="status-indicator"
                            style={{
                                backgroundColor: isConnected ? '#00ff66' : '#ff3333',
                                color: isConnected ? '#00ff66' : '#ff3333'
                            }}
                        />
                        <span className="font-bold text-xs">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                    <div className="text-cyan text-xs">V.1.0.0</div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-end">
                <div className="gesture-box">
                    <div className="text-cyan text-xs uppercase mb-1">Current Gesture</div>
                    <div className="text-2xl font-bold font-mono uppercase transition-colors duration-300"
                        style={{
                            color: gesture === 'Scroll Mode' ? '#ffaa00' :
                                gesture === 'Right Click' ? '#aa00ff' :
                                    gesture === 'Drag / Click' ? '#ff0055' : 'white'
                        }}
                    >
                        {gesture}
                    </div>
                </div>

                <div className="text-cyan opacity-40 text-xs">
                    MEDIAPIPE // TENSORFLOW // WEBGPU
                </div>
            </div>
        </div>
    );
}
