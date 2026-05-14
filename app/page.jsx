import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-ups-black flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-ups-gold mb-4">GRIEVANCE AI</h1>
      <p className="text-gray-400 text-xl mb-12">Contract Analysis & Grievance Filing System</p>
      <div className="space-x-4">
        <Link href="/login">
          <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-8 rounded uppercase">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="bg-ups-gold hover:bg-ups-brown text-ups-brown hover:text-ups-gold font-bold py-3 px-8 rounded uppercase">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
