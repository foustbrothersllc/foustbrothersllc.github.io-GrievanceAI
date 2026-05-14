'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// ... rest of imports

function AnalyzePageContent() {
  // Move all the component code here
  const [contract, setContract] = useState(null);
  // ... rest of your code
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ups-black flex items-center justify-center"><p className="text-ups-gold">Loading...</p></div>}>
      <AnalyzePageContent />
    </Suspense>
  );
}
