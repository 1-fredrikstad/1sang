import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-[#69869F]">
      <div className="mx-auto flex max-w-md items-center px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
          <Image src="/ScoutLogo.png" alt="Scout Logo" width={58} height={58} priority />
          <span className="flex flex-col leading-tight text-white text-sm">
            <span>Sanger</span>
            <span>Under</span>
            <span>Liljen</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
