// Gesture debounce utility
export function createGestureDebouncer(cooldownMs = 400) {
  let lastGesture = null;
  let lastTime = 0;
  return function debounce(gesture, onFire) {
    const now = Date.now();
    if (gesture !== lastGesture || now - lastTime > cooldownMs) {
      lastGesture = gesture;
      lastTime = now;
      onFire();
    }
  };
}
