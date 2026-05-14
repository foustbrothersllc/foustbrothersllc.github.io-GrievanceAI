'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ref, uploadBytes, listAll, getBytes } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import Link from 'next/link';

const storage = getStorage();

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadContracts(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadContracts = async (userId) => {
    try {
      const contractsRef = ref(storage, `contracts/${userId}`);
      const result = await listAll(contractsRef);
      
      const contractList = result.items.map(item => ({
        name: item.name,
        path: item.fullPath,
        uploadedAt: new Date(item.metadata?.timeCreated).toLocaleDateString()
      }));
      
      setContracts(contractList);
    } catch (err) {
      console.error('Error loading contracts:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - accept PDF and JSON
    const validTypes = ['application/pdf', 'application/json'];
    const validExtensions = ['.pdf', '.json'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      setError('Please upload a PDF or JSON file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const contractRef = ref(storage, `contracts/${user.uid}/${file.name}`);
      await uploadBytes(contractRef, file);
      
      // Reload contracts list
      await loadContracts(user.uid);
      
      // Clear input
      e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ups-black flex items-center justify-center">
        <p className="text-ups-gold text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ups-black">
      {/* Header */}
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-ups-gold hover:text-yellow-300 cursor-pointer">
              GRIEVANCE AI
            </h1>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Welcome, {user?.email}!</h2>
          <p className="text-gray-400">Contract Analysis & Grievance Filing</p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Upload Contract</h3>
          
          {error && (
            <div className="bg-red-900 border-2 border-red-600 text-red-100 p-4 rounded mb-4">
              {error}
            </div>
          )}

          <div className="border-2 border-dashed border-ups-brown rounded-lg p-8 text-center mb-6 hover:border-ups-gold transition-colors">
            <label className="cursor-pointer">
              <div className="text-ups-gold text-6xl mb-4">📄</div>
              <p className="text-ups-gold font-semibold mb-2">Choose a Contract File</p>
              <p className="text-gray-400 text-sm mb-4">PDF or JSON</p>
              <input
                type="file"
                accept=".pdf,.json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <button
                onClick={(e) => e.currentTarget.parentElement.parentElement.querySelector('input').click()}
                disabled={uploading}
                className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase disabled:opacity-50"
              >
                {uploading ? 'UPLOADING...' : 'SELECT FILE'}
              </button>
            </label>
          </div>

          <p className="text-gray-400 text-sm text-center">
            Maximum file size: 10MB • Supported formats: PDF, JSON
          </p>
        </div>

        {/* Contracts List */}
        {contracts.length > 0 && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
            <h3 className="text-2xl font-bold text-ups-gold mb-6">Your Contracts</h3>
            
            <div className="space-y-3">
              {contracts.map((contract, index) => (
                <div key={index} className="bg-gray-800 border border-ups-brown rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{contract.name}</p>
                    <p className="text-gray-400 text-sm">Uploaded: {contract.uploadedAt}</p>
                  </div>
                  <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-4 rounded transition-all duration-300 uppercase text-sm">
                    Analyze
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {contracts.length === 0 && !uploading && (
          <div className="bg-gray-800 border-2 border-ups-brown rounded-lg p-8 text-center">
            <p className="text-gray-400">No contracts uploaded yet. Upload one to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}
