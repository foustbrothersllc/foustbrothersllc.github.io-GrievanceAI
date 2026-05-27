'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/hub');
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold text-xl">Loading...</p>
    </div>
  );
}
