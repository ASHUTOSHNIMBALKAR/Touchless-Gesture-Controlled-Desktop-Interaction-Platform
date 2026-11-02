import HandTracker from '@/components/HandTracker';
import Overlay from '@/components/Overlay';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <HandTracker />
      <Overlay />
    </main>
  );
}
