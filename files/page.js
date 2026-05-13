'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-ups-black flex flex-col items-center justify-center px-4">
      {/* Main Content */}
      <div className="animate-fade-in max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ups-gold mb-3">
            CONTRACT ANALYZER
          </h1>
          <p className="text-gray-400 text-lg">
            Analyze contracts. Detect violations. File grievances.
          </p>
        </div>

        {/* Main Card */}
        <div className="card mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-ups-gold mb-2">
              Welcome
            </h2>
            <p className="text-gray-400 text-sm">
              Sign in to your account to get started
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/login">
              <button className="btn btn-primary w-full py-3">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="btn btn-secondary w-full py-3">
                Create Account
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="card">
          <h3 className="text-up-gold font-bold mb-4 text-sm uppercase">
            Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-ups-gold font-bold">✓</span>
              <span>Upload and analyze contracts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ups-gold font-bold">✓</span>
              <span>AI-powered violation detection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ups-gold font-bold">✓</span>
              <span>Generate formal grievance documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ups-gold font-bold">✓</span>
              <span>Download printable PDFs</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-xs text-gray-600">
        <p>Contract Analyzer • Open Source</p>
      </div>
    </div>
  );
}
