'use client';

import { Song } from '@/src/lib/db';
import { useMemo, useState } from 'react';
import { searchSongs } from '@/src/lib/search/searchSongs';

export function useSongPicker(
  songs: Song[],
  songsInPlaylist: Song[],
  setSongsInPlaylist: (songs: Song[]) => void,
  open: boolean
) {
  const [search, setSearch] = useState('');
  const effectiveSearch = open ? search : '';

  const filteredSongs = useMemo(() => {
    return searchSongs(songs ?? [], effectiveSearch);
  }, [songs, effectiveSearch]);

  function isSongAdded(id: string) {
    return songsInPlaylist.some((s) => s.id === id);
  }

  function toggleSong(song: Song) {
    const exists = songsInPlaylist.some((s) => s.id === song.id);

    if (exists) {
      setSongsInPlaylist(songsInPlaylist.filter((s) => s.id !== song.id));
    } else {
      setSongsInPlaylist([...songsInPlaylist, song]);
    }
  }

  function clearAll() {
    setSongsInPlaylist([]);
  }

  function selectAll() {
    setSongsInPlaylist(filteredSongs);
  }

  const allSelected = filteredSongs.length > 0 && filteredSongs.every((s) => isSongAdded(s.id));

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
