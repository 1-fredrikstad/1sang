import Campfire from '@/src/components/Campfire';

export const metadata = {
  title: 'Du er offline',
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Campfire message="Du er offline. Koble til internett for å se denne siden." />
    </div>
  );
}
