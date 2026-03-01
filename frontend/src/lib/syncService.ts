import { db } from './db';
import { createClient } from './supabase/client';

type TableName =
  | 'songs'
  | 'playlists'
  | 'tags'
  | 'playlist_items'
  | 'song_tags'
  | 'song_links'
  | 'song_suggestions'
  | 'admin_users';

type SyncOptions = { forceFresh?: boolean };

class SyncService {
  private supabase: ReturnType<typeof createClient> | null = null;
  private syncing = new Set<TableName>();

  private getSupabase() {
    if (!this.supabase) this.supabase = createClient();
    return this.supabase;
  }

  async syncTable(tableName: TableName, options: SyncOptions = {}) {
    if (this.syncing.has(tableName) && !options.forceFresh) return;

    this.syncing.add(tableName);
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;

      // update dexie cache with fresh data
      if (data) {
        const table = db.table(tableName);
        await table.clear();
        await table.bulkPut(data);
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
}

export const syncService = new SyncService();
