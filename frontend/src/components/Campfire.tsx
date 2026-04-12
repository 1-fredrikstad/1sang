'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

export default function Campfire() {
  const [boost, setBoost] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleClick() {
    setBoost(true);

    try {
      if (!audioRef.current) {
        const audio = new Audio('campfire/sounds/fire_crackling_75.mp3');
        audio.volume = 0.4;
        audioRef.current = audio;
      }

      const audio = audioRef.current!;

      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.error('Playback failed:', err);
      });

      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setBoost(false);
      }, 7500);
    } catch (e) {
      console.error('Audio setup failed:', e);
      setBoost(false);
    }
  }

  return (
    <div className="flex flex-col mx-auto items-center justify-center gap-5 text-center min-h-[60vh]">
      <div>
        <h1 className="mb-0!">Du har gått deg vill i skogen</h1>
        <h2 className="mt-0 text-lg text-muted-foreground">Denne siden finnes ikke</h2>
      </div>
      <div
        className="flex flex-col items-center leading-none cursor-pointer mt-7"
        onClick={handleClick}
      >
        <Image
          src="campfire/only_fire.svg"
          alt="Fire"
          width={100}
          height={100}
          loading="eager"
          className={`allow-transition transition-all duration-300 z-5 ${boost ? 'fire-boost' : 'fire-idle'}`}
        ></Image>
        <Image
          src="campfire/wood2.png"
          alt="Wood"
          width={80}
          height={80}
          loading="eager"
          className="-mt-3 fire-idle"
        ></Image>
      </div>
      <p className="text-muted-foreground italic">Trykk for å legge på ved</p>
    </div>
  );
}
