export type SavePlaylistResult =
  | { type: 'private'; localId: string }
  | { type: 'public'; localId: string; serverId: string }
  | { type: 'pending'; localId: string; error: string };
