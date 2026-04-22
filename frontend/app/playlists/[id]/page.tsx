// app/playlists/[id]/page.tsx
export const dynamic = 'force-static';

import PlaylistClient from './PlaylistClient';

export default function PlaylistPage() {
  return <PlaylistClient />;
}
