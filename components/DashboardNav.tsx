'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/dashboard' },
  { icon: '📹', label: 'Submissions', href: '/dashboard/submissions' },
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="w-64 bg-[#1A1A1A] text-white p-6">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Voizz Logo" width={100} height={32} priority />
        </Link>
      </div>

      <div className="mb-8">
        <Link
          href="/dashboard/create"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <span>+</span>
          <span>Create New Interview</span>
        </Link>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  );
}
