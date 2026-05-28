import Dexie, { type Table } from 'dexie';

export interface Song {
  id: string;
  title: string;
  slug?: string;
  author?: string;
  melody?: string;
  chorus?: string;
  verses: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  spotify_youtube?: string;
  has_chords: boolean;
  song_number?: number | null;
}

export interface Playlist {
  id: string; // local ID (always exists)
  server_id?: string; // backend ID (only if synced and public)
  synced: number; // Check if synced
  title: string;
  playlist_password: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
  is_public: boolean;
  expires_at: string | null;
  has_password?: boolean;
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

export interface SongSuggestion {
  id: string;
  title: string;
  author?: string;
  melody?: string;
  chorus?: string;
  verses: string[];
  status?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  spotify_youtube: string;
  has_chords: boolean;
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

export interface FavoriteSong {
  song_id: string;
  created_at: string;
}

export interface SuggestionDraft {
  id: string;
  title: string;
  author?: string;
  melody?: string;
  chorus?: string;
  verses: string[];
  spotify_youtube?: string;
  has_chords: boolean;
  created_at: string;
  updated_at: string;
}

export class AppDatabase extends Dexie {
  songs!: Table<Song, string>;
  playlists!: Table<Playlist, string>;
  playlist_items!: Table<PlaylistItem, [string, string]>;
  tags!: Table<Tag, string>;
  song_tags!: Table<SongTag, [string, string]>;
  song_suggestions!: Table<SongSuggestion, string>;
  users!: Table<AdminUser, string>;
  sync_metadata!: Table<SyncMetadata, string>;
  favorites!: Table<FavoriteSong, string>;
  suggestion_drafts!: Table<SuggestionDraft, string>;

  constructor() {
    super('1sang');

    this.version(1).stores({
      songs: 'id, slug',
      playlists: 'id',
      playlist_items: '[playlist_id+song_id], playlist_id, song_id, position',
      tags: 'id, name',
      song_tags: '[song_id+tag_id], song_id, tag_id',
      song_suggestions: 'id, status',
      users: 'user_id',
      sync_metadata: 'id, table_name',
    });

    this.version(2).stores({
      songs: 'id, slug',
      playlists: 'id',
      playlist_items: '[playlist_id+song_id], playlist_id, song_id, position',
      tags: 'id, name',
      song_tags: '[song_id+tag_id], song_id, tag_id',
      song_suggestions: 'id, status',
      users: 'user_id',
      sync_metadata: 'id, table_name',
      favorites: 'song_id, created_at',
    });

    this.version(3).stores({
      songs: 'id, slug',
      playlists: 'id, &server_id, synced',
      playlist_items: '[playlist_id+song_id], playlist_id, song_id, position',
      tags: 'id, name',
      song_tags: '[song_id+tag_id], song_id, tag_id',
      song_suggestions: 'id, status',
      users: 'user_id',
      sync_metadata: 'id, table_name',
      favorites: 'song_id, created_at',
    });

    this.version(4).stores({
      songs: 'id, slug',
      playlists: 'id, &server_id, synced',
      playlist_items: '[playlist_id+song_id], playlist_id, song_id, position',
      tags: 'id, name',
      song_tags: '[song_id+tag_id], song_id, tag_id',
      song_suggestions: 'id, status',
      users: 'user_id',
      sync_metadata: 'id, table_name',
      favorites: 'song_id, created_at',
    });

    this.version(5).stores({
      songs: 'id, slug',
      playlists: 'id, &server_id, synced',
      playlist_items: '[playlist_id+song_id], playlist_id, song_id, position',
      tags: 'id, name',
      song_tags: '[song_id+tag_id], song_id, tag_id',
      song_suggestions: 'id, status',
      users: 'user_id',
      sync_metadata: 'id, table_name',
      favorites: 'song_id, created_at',
      suggestion_drafts: 'id, updated_at',
    });
  }
}

export const db = new AppDatabase();
