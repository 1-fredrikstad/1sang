'use client';
import HeaderColorForm from '@/src/components/HeaderColorForm';
import ThemeToggleButton from '@/src/components/ThemeToggleButton';
import WakeLockToggle from '@/src/components/songs/WakeLockToggle';

export default function Settings() {
  return (
    <main className="flex flex-col  gap-2">
      <h1>Innstillinger</h1>
      <WakeLockToggle />
      <ThemeToggleButton />
      <HeaderColorForm />
    </main>
  );
}
