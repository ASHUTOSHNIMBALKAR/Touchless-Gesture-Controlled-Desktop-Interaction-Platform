'use client';
import { useEffect, useRef } from 'react';

export default function HandTracker() {
  const videoRef = useRef(null);
  useEffect(() => {
    async function startCamera() {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    }
    startCamera();
  }, []);
  return <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />;
}
