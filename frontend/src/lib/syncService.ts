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
  private initialSyncPromise: Promise<void> | null = null;

  private getSupabase() {
    if (!this.supabase) this.supabase = createClient();
    return this.supabase;
  }

  private getAutoSyncTables(): TableName[] {
    return ['songs', 'tags', 'song_tags', 'song_links', 'song_suggestions', 'users'];
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

      if (data) {
        const table = db.table(tableName);
        const tablesWithTwoIds: TableName[] = ['song_tags', 'playlist_items'];

        if (tablesWithTwoIds.includes(tableName)) {
          await table.clear();
          await table.bulkPut(data);
        } else {
          type RowWithId = { id: string };

          const remoteRows = data as RowWithId[];
          const remoteIds = new Set(remoteRows.map((row) => row.id));

          await table.bulkPut(data);

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

  async initialSync(forceFresh = true) {
    if (this.initialSyncPromise) {
      return this.initialSyncPromise;
    }

    this.initialSyncPromise = (async () => {
      if (!navigator.onLine) return;

      const tables = this.getAutoSyncTables();

      try {
        await syncPlaylists();

        await Promise.all(tables.map((table) => this.syncTable(table, { forceFresh })));
      } finally {
        this.initialSyncPromise = null;
      }
    })();

    return this.initialSyncPromise;
  }

  startAutoSync(intervalMs = 180000) {
    const tables = this.getAutoSyncTables();

    const run = async (forceFresh = false) => {
      if (!navigator.onLine) return;

      try {
        await syncPlaylists();
        await Promise.all(tables.map((table) => this.syncTable(table, { forceFresh })));
      } catch (err) {
        console.error('Auto sync failed:', err);
      }
    };

    void this.initialSync(true).catch((err) => {
      console.error('Initial sync failed:', err);
    });

    const interval = setInterval(() => {
      void run(false);
    }, intervalMs);

    const handleOnline = () => {
      void run(true);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }
}

export const syncService = new SyncService();
