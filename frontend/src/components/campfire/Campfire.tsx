'use client';

import Image from 'next/image';
import { useCampfire } from '../../hooks/useCampfire';

interface Props {
  message: string;
}

export default function Campfire({ message }: Props) {
  const { boost, trigger } = useCampfire();

  return (
    <main className="flex flex-col mx-auto items-center justify-center gap-5 text-center min-h-[50vh]">
      {/* Text section: main message + dynamic status message */}
      <section>
        <h1 className="mb-0!">Du har gått deg vill i skogen</h1>
        <h2 className="mt-0 text-lg text-muted-foreground">{message}</h2>
      </section>

      {/* Interactive campfire area */}
      <section
        className="flex flex-col items-center leading-none cursor-pointer mt-7"
        onClick={trigger}
      >
        {/* Fire animation element (changes class based on boost state) */}
        <Image
          src="/campfire/only_fire.svg"
          alt="Fire"
          width={100}
          height={100}
          loading="eager"
          className={`allow-transition transition-all z-5 ${boost ? 'fire-boost' : 'fire-idle'}`}
          unoptimized
        />

        {/* Wood visual under fire */}
        <Image
          src="/campfire/wood2.png"
          alt="Wood"
          width={80}
          height={80}
          loading="eager"
          className="-mt-3 fire-idle"
          unoptimized
        />
      </section>

      {/* Hint text for interaction */}
      <p className="text-muted-foreground italic">Trykk for å legge på ved</p>
    </main>
  );
}
