'use client';
import HeaderColorForm from '@/src/components/HeaderColorForm';
import ThemeToggleButton from '@/src/components/ThemeToggleButton';

export default function Settings() {
  return (
    <main className="flex flex-col justify-center items-center gap-2 mt-20">
      <ThemeToggleButton />
      <HeaderColorForm />
    </main>
  );
}
