import CampfirePage from '../../src/components/campfire/CampfirePage';

export const metadata = {
  title: 'Du er offline',
};

export default function OfflinePage() {
  return <CampfirePage message="Du er offline. Koble til internett for å se denne siden." />;
}
