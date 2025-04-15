'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-[#1A1A1A] border-b border-gray-800 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">
          Welcome Back, {user?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-sm text-gray-400">AI-Driven Interviews, Hassel-Free Hiring</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="w-8 h-8 bg-gray-800 rounded-full text-white flex items-center justify-center">
          {user?.email?.[0].toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  );
}
