import { create } from 'zustand';

export const useGestureStore = create((set) => ({
  isConnected: false,
  isTracking: false,
  currentGesture: null,
  setConnected: (v) => set({ isConnected: v }),
  setTracking: (v) => set({ isTracking: v }),
  setGesture: (g) => set({ currentGesture: g }),
}));
