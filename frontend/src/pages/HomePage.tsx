'use client';

import Link from "next/link";

return (
    <ul>
      {songs?.map((song) => (
        <li key={song.id}>
          <Link href={`/songs/${song.id}`}>
            {song.title}
          </Link>
        </li>
      ))}
    </ul>
  );