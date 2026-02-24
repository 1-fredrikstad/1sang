import { db } from './db';

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
  private syncing = new Set<TableName>();

  private apiUrlFor(tableName: TableName, params?: Record<string, string>) {
    const search = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return `/api/${tableName}${search}`;
  }

  async syncTable(tableName: TableName, options: SyncOptions = {}) {
    if (this.syncing.has(tableName) && !options.forceFresh) return;

    this.syncing.add(tableName);
    try {
      const url = this.apiUrlFor(tableName);
      const res = await fetch(url, { cache: 'no-store' });
      const body = await res.json();

      if (!res.ok || !body.ok) {
        const err = body?.error || `Failed to fetch ${tableName}`;
        throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
      }

      const data = body.data;

      if (Array.isArray(data)) {
        const table = db.table(tableName as any);
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