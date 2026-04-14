'use client';

import Image from 'next/image';
import { useCampfire } from '../hooks/useCampfire';

export default function Campfire() {
  const { boost, trigger } = useCampfire();

  return (
    <main className="flex flex-col mx-auto items-center justify-center gap-5 text-center min-h-[60vh]">
      <section>
        <h1 className="mb-0!">Du har gått deg vill i skogen</h1>
        <h2 className="mt-0 text-lg text-muted-foreground">Denne siden finnes ikke</h2>
      </section>
      <section
        className="flex flex-col items-center leading-none cursor-pointer mt-7"
        onClick={trigger}
      >
        <Image
          src="/campfire/only_fire.svg"
          alt="Fire"
          width={100}
          height={100}
          loading="eager"
          className={`allow-transition transition-all z-5 ${boost ? 'fire-boost' : 'fire-idle'}`}
        ></Image>
        <Image
          src="/campfire/wood2.png"
          alt="Wood"
          width={80}
          height={80}
          loading="eager"
          className="-mt-3 fire-idle"
        ></Image>
      </section>
      <p className="text-muted-foreground italic">Trykk for å legge på ved</p>
    </main>
  );
}
