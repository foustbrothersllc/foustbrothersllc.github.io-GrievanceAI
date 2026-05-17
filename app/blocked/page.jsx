'use client';

import Link from 'next/link';

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-ups-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-ups-gold mb-8">GRIEVANCE AI</h1>
        <div className="bg-gray-900 border-2 border-red-700 rounded-lg p-8">
          <div className="text-6xl mb-6">⛔</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Account Access Blocked</h2>
          <p className="text-gray-400 mb-6">Your account has been blocked. Please contact your union representative for assistance.</p>
          <Link href="/login">
            <button className="w-full bg-ups-brown text-ups-gold py-3 rounded uppercase font-bold">
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
