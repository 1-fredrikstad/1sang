import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  // Responsive header: centered for desktop (lg) and left-aligned for mobile
  return (
    <header className="w-full  bg-navbar-bg">
      <div className="mx-auto px-4 py-3">
        <div className="mx-auto max-w-md lg:max-w-4xl">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex items-center gap-3 justify-start lg:justify-center"
          >
            <Image
              src="/favicon/favicon.svg"
              alt="Scout Logo"
              width={175}
              height={200}
              className="h-14.5 w-auto"
              priority
            />

            <span className="text-navbar-title text-base leading-tight flex flex-col lg:flex-row lg:items-baseline lg:gap-2 lg:text-lg">
              <span>Sanger</span>
              <span>under</span>
              <span>liljen</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
