'use client';
import { useEffect, useRef } from 'react';
import { useGestureStore } from '../store/useGestureStore';

export default function HandTracker() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const { setConnected, isTracking } = useGestureStore();
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, [setConnected]);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);
  return <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />;
}
