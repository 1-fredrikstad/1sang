import { useEffect, useRef, useState } from 'react';

export function useCampfire() {
  const [boost, setBoost] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stops sound effect and resets state
  function stop() {
    const audio = audioRef.current;

    // Clear auto-stop timer if active
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop and reset audio playback
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setBoost(false);
  }

  // Starts campfire sound + temporary "boost" state
  function start() {
    setBoost(true);

    // Initialize audio only once
    if (!audioRef.current) {
      const audio = new Audio('/campfire/sounds/fire_crackling_75.mp3');
      audio.volume = 0.4;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    // Restart sound from beginning
    audio.currentTime = 0;

    audio.play().catch(() => {
      // Ignore autoplay restrictions in some environments
    });

    // Auto-stop after 7.5 seconds
    timeoutRef.current = setTimeout(() => {
      stop();
    }, 7500);
  }

  // Toggle campfire effect on/off
  function trigger() {
    if (boost) {
      stop();
    } else {
      start();
    }
  }

  // Cleans up audio: stops audio on umount (route change)
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    boost,
    trigger,
  };
}
