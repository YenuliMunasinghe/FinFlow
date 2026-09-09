'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0e1c2f] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <span className="font-['Hanken_Grotesk'] text-3xl font-bold tracking-tight">
          Fin<span className="text-[#38BDF8]">Flow</span>
        </span>
        <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#77849c]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span>Redirecting to FinFlow Portal...</span>
        </div>
      </div>
    </div>
  );
}

