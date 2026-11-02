import { create } from 'zustand';

interface GestureState {
  isConnected: boolean;
  cursorX: number;
  cursorY: number;
  gesture: string;
  setConnected: (status: boolean) => void;
  updateCursor: (x: number, y: number) => void;
  setGesture: (gesture: string) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
  isConnected: false,
  cursorX: 0,
  cursorY: 0,
  gesture: 'Hover', // Default
  setConnected: (status) => set({ isConnected: status }),  
  updateCursor: (x, y) => set({ cursorX: x, cursorY: y }),
  setGesture: (g) => set({ gesture: g }),
}));
