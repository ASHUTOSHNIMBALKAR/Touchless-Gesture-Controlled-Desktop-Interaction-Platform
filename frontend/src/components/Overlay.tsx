'use client';
import { useGestureStore } from '../store/useGestureStore';

export default function Overlay() {
  const { isConnected, isTracking, currentGesture } = useGestureStore();
  return (
    <div style={{ position: 'fixed', top: 16, left: 16, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '12px 16px', borderRadius: 8, fontFamily: 'monospace', fontSize: 14 }}>
      <div>WS: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Tracking: {isTracking ? 'Active' : 'Paused'}</div>
      <div>Gesture: {currentGesture ?? 'None'}</div>
    </div>
  );
}
