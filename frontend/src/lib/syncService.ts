import { db } from './db';
import { syncPlaylists } from './playlists/syncPlaylists';
import { createClient } from './supabase/client';

type TableName =
  | 'songs'
  | 'playlists'
  | 'tags'
  | 'playlist_items'
  | 'song_tags'
  | 'song_links'
  | 'song_suggestions'
  | 'users';

type SyncOptions = { forceFresh?: boolean };

class SyncService {
  private supabase: ReturnType<typeof createClient> | null = null;
  private syncing = new Set<TableName>();

  private getSupabase() {
    if (!this.supabase) this.supabase = createClient();
    return this.supabase;
  }

  async syncTable(tableName: TableName, options: SyncOptions = {}) {
    if (!options.forceFresh) {
      const stale = await this.isTableStale(tableName, 5);
      if (!stale) return;
    }
    if (this.syncing.has(tableName) && !options.forceFresh) return;

    this.syncing.add(tableName);
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;

      // update dexie cache with fresh data
      if (data) {
        const table = db.table(tableName);
        await table.bulkPut(data);

        const tablesWithTwoIds: TableName[] = ['song_tags', 'playlist_items'];

        if (tablesWithTwoIds.includes(tableName)) {
          // enkel strategi
          await table.clear();
          await table.bulkPut(data);
        } else {
          // behold eksisterende diff-logikk
          await table.bulkPut(data);

          type RowWithId = { id: string };

          const remoteRows = data as RowWithId[];

          const remoteIds = new Set(remoteRows.map((row) => row.id));

          const localRows = (await table.toArray()) as RowWithId[];

          const idsToDelete = localRows
            .filter((row) => row.id != null && !remoteIds.has(row.id))
            .map((row) => row.id);

          if (idsToDelete.length > 0) {
            await table.bulkDelete(idsToDelete);
          }
        }
      }

      await db.sync_metadata.put({
        id: tableName,
        table_name: tableName,
        last_synced_at: new Date().toISOString(),
      });
    } finally {
      this.syncing.delete(tableName);
    }
  }

  async getLastSyncTime(tableName: TableName) {
    const meta = await db.sync_metadata.get(tableName);
    return meta ? new Date(meta.last_synced_at) : null;
  }

  async isTableStale(tableName: TableName, maxAgeMins = 5) {
    const last = await this.getLastSyncTime(tableName);
    if (!last) return true;
    return Date.now() - last.getTime() > maxAgeMins * 60 * 1000;
  }

  // Auto sync every 3 minutes
  startAutoSync(intervalMs = 180000) {
    const tables: TableName[] = [
      'songs',
      'tags',
      'song_tags',
      'song_links',
      'song_suggestions',
      'users',
    ];

    const run = async () => {
      if (!navigator.onLine) return;

      try {
        // Sync playlists
        await syncPlaylists();

        // Sync all other tables
        await Promise.all(tables.map((table) => this.syncTable(table)));
      } catch (err) {
        console.error('Auto sync failed:', err);
      }
    };

    // run immediately
    run();

    // periodic sync
    const interval = setInterval(run, intervalMs);

    // sync when back online
    window.addEventListener('online', run);

    // cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', run);
    };
  }
}

export const syncService = new SyncService();
