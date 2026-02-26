'use client';

import { Suspense } from 'react';
import { HomePage } from './pages/HomePage';

export default function Page() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <HomePage />
    </Suspense>
  );
}
