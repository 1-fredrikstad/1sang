import Dexie, { type Table } from 'dexie';

export interface Song {
  id: string;
  title: string;
  slug?: string;
  author?: string;
  melody?: string;
  lyrics: string;
  chords?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Playlist {
  id: string;
  title: string;
  playlist_password: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
}

export interface PlaylistItem {
  playlist_id: string;
  song_id: string;
  position: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface SongTag {
  song_id: string;
  tag_id: string;
}

export interface SongLink {
  id: string;
  song_id?: string;
  url: string;
}

export interface SongSuggestion {
  id: string;
  title: string;
  author?: string;
  melody?: string;
  lyrics: string;
  chords?: string;
  status?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface AdminUser {
  user_id: string;
  created_at?: string;
}

export interface SyncMetadata {
  id: string;
  table_name: string;
  last_synced_at: string;
}

export class AppDatabase extends Dexie {
  songs!: Table<Song>;
  playlists!: Table<Playlist>;
  playlist_items!: Table<PlaylistItem>;
  tags!: Table<Tag>;
  song_tags!: Table<SongTag>;
  song_links!: Table<SongLink>;
  song_suggestions!: Table<SongSuggestion>;
  admin_users!: Table<AdminUser>;
  sync_metadata!: Table<SyncMetadata>;

  constructor() {
    super('1sang');
    this.version(1).stores({
      songs: 'id, slug',
      playlists: 'id',
      playlist_items: '[playlist_id+song_id], playlist_id, song_id, position',
      tags: 'id, name',
      song_tags: '[song_id+tag_id], song_id, tag_id',
      song_links: 'id, song_id',
      song_suggestions: 'id, status',
      admin_users: 'user_id',
      sync_metadata: 'id, table_name',
    });
  }
}

export const db = new AppDatabase();
