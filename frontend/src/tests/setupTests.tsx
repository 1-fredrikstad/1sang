/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

//Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} />;
  },
}));

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/',
  };
});
