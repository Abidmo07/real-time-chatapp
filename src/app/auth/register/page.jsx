"use client";
import React, { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/supabase';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOAuthSignIn = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'http://localhost:3000/chat',
      },
    });
    if (error) console.error("OAuth error:", error.message);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/chat')
      setSuccessMsg('Check your email to confirm your registration.');
      setFormData({ full_name: '', email: '', password: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-4">Welcome to Chatify</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Create your account or sign in with a provider</p>

        {/* OAuth Buttons */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition shadow"
          >
            <FaGoogle size={20} />
            Sign in with Google
          </button>

          <button
            onClick={() => handleOAuthSignIn('github')}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl transition shadow"
          >
            <FaGithub size={20} />
            Sign in with GitHub
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative text-sm text-gray-400 text-center bg-white px-2">
            or register with email
          </div>
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}

          <div>
            <label htmlFor="full_name" className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition font-medium"
          >
            Create Account
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          By signing up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
