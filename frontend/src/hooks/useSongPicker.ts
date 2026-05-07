'use client';

import { Song } from '@/src/lib/db';
import { useMemo, useState } from 'react';
import { searchSongs } from '@/src/lib/search/searchSongs';
import { ScoredSong } from '../types/scoredSong';

export function useSongPicker(
  songs: Song[],
  songsInPlaylist: Song[],
  setSongsInPlaylist: (songs: Song[]) => void,
  open: boolean
) {
  const [search, setSearch] = useState('');

  // Only enable search while modal is open
  const effectiveSearch = open ? search : '';

  // Search + scoring
  const filteredSongs: ScoredSong[] = useMemo(() => {
    return searchSongs(songs ?? [], effectiveSearch);
  }, [songs, effectiveSearch]);

  // Check if song is already in playlist
  function isSongAdded(id: string) {
    return songsInPlaylist.some((s) => s.id === id);
  }

  // Toggle song in/out of playlist
  function toggleSong(song: Song) {
    const exists = songsInPlaylist.some((s) => s.id === song.id);

    if (exists) {
      setSongsInPlaylist(songsInPlaylist.filter((s) => s.id !== song.id));
    } else {
      setSongsInPlaylist([...songsInPlaylist, song]);
    }
  }

  // Remove all songs
  function clearAll() {
    setSongsInPlaylist([]);
  }

  // Add all filtered songs
  function selectAll() {
    setSongsInPlaylist(filteredSongs.map((s) => s.song));
  }

  // Selection state helpers
  const allSelected =
    filteredSongs.length > 0 && filteredSongs.every((s) => isSongAdded(s.song.id));
  const noneSelected = songsInPlaylist.length === 0;

  function handleSelectAllChange(checked: boolean | 'indeterminate') {
    if (checked) selectAll();
    else clearAll();
  }

  return {
    search,
    setSearch,
    filteredSongs,
    isSongAdded,
    toggleSong,
    clearAll,
    selectAll,
    handleSelectAllChange,
    allSelected,
    noneSelected,
    selectedCount: songsInPlaylist.length,
  };
}
