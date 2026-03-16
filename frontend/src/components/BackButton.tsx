'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (pathname === '/admin') {
      router.push('/');
    } else {
      router.back();
    }
  };

  return (
    <button id="arrow-back" onClick={handleBack} className="hover:cursor-pointer">
      <span className="hidden md:block">Tilbake</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path
          fillRule="evenodd"
          d="M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
