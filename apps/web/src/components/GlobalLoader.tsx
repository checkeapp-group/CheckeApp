import { NewtonsCradle } from 'ldrs/react';
import 'ldrs/react/NewtonsCradle.css';

export default function GlobalLoader() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <NewtonsCradle color="#0f766e" size="60" speed="1.4" />
      </div>
    </div>
  );
}
