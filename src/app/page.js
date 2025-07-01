import Link from 'next/link';
import React from 'react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">BorzChat</h1>
        <p className="text-lg text-gray-800 mb-8">
          Connect instantly. Chat securely. Experience the future of conversation.
        </p>
        <div className="flex justify-center space-x-4">
          
          <Link
          href={'/auth/register'}
            className="px-8 py-3 font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
