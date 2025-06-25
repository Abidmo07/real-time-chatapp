"use client"
import React from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const router=useRouter();
const handleSignIn = async (provider) => {
  const {data,error } = await supabase.auth.signInWithOAuth({
    provider,
    options:{
      redirectTo:'http://localhost:3000/chat'

    }
  });
  if (error) console.error('Error signing in:', error.message);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Chatify</h1>
        <p className="text-sm text-gray-500 mb-8">Sign in to continue the conversation</p>

        <button
          onClick={() => handleSignIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition mb-4 shadow-md"
        >
          <FaGoogle size={20} />
          Sign in with Google
        </button>

        <button
          onClick={() => handleSignIn('github')}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl transition shadow-md"
        >
          <FaGithub size={20} />
          Sign in with GitHub
        </button>

        <p className="text-xs text-gray-400 mt-8">
          By signing in, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
