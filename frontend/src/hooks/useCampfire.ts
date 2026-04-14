import { useRef, useState } from 'react';

export function useCampfire() {
  const [boost, setBoost] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function stop() {
    const audio = audioRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setBoost(false);
  }

  function start() {
    setBoost(true);

    if (!audioRef.current) {
      const audio = new Audio('/campfire/sounds/fire_crackling_75.mp3');
      audio.volume = 0.4;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    audio.currentTime = 0;

    audio.play().catch(() => {
      // ignore autoplay issues in tests
    });

    timeoutRef.current = setTimeout(() => {
      stop();
    }, 7500);
  }

  function trigger() {
    if (boost) {
      stop();
    } else {
      start();
    }
  }

  return {
    boost,
    trigger,
  };
}
