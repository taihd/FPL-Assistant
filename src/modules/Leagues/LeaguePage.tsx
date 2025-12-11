import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export function LeaguePage() {
  const { setScreen } = useAppContext();

  useEffect(() => {
    setScreen('leagues');
  }, [setScreen]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Leagues</h1>
      <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
        <p className="text-slate-300">Leagues module coming soon...</p>
      </div>
    </div>
  );
}

