'use client';

import LogoutButton from './LogoutButton';

export default function NoAccess() {
  return (
    <>
      <p className="mb-2">Ingen tilgang</p>
      <p className="text-sm opacity-70 mb-4">Logg ut og prøv med en annen bruker.</p>
      <LogoutButton />
    </>
  );
}
