'use client';

import { useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<string | null>(null);

  function changeTheme(newTheme: string | null) {
    setTheme(newTheme);
    if (newTheme) document.documentElement.dataset.theme = newTheme;
    else document.documentElement.removeAttribute('data-theme');
  }

  return { theme, changeTheme };
}
