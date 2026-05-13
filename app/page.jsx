'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-ups-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-ups-gold mb-4">Grievance AI</h1>
        <p className="text-gray-400 mb-12 text-lg">Contract Analysis & Grievance Filing</p>
        
        <div className="space-y-4">
          <Link href="/login">
            <button className="w-full max-w-md bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-6 rounded transition-all duration-300 uppercase tracking-wide">
              Sign In
            </button>
          </Link>
          
          <Link href="/signup">
            <button className="w-full max-w-md bg-transparent hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-6 rounded border-2 border-ups-gold transition-all duration-300 uppercase tracking-wide">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
