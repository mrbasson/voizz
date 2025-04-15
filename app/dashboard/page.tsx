'use client';

import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the PaymentPlans component with no SSR
const PaymentPlans = dynamic(
  () => import('../components/PaymentPlans'),
  { ssr: false }
);

export default function Dashboard() {
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  
  const recentInterviews = [
    { id: 1, position: 'Full Stack Developer', date: '2025-04-10', status: 'Completed' },
    { id: 2, position: 'Frontend Developer', date: '2025-04-09', status: 'Scheduled' },
    { id: 3, position: 'Backend Developer', date: '2025-04-08', status: 'In Progress' },
  ];

  const stats = [
    { label: 'Total Interviews', value: '24' },
    { label: 'Completed', value: '18' },
    { label: 'Scheduled', value: '3' },
    { label: 'Success Rate', value: '85%' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800"
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Payment Plans Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Interview Packages</h2>
        <button
          onClick={() => setShowPaymentPlans(!showPaymentPlans)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showPaymentPlans ? 'Hide Packages' : 'View Packages'}
        </button>
      </div>

      {/* Payment Plans */}
      {showPaymentPlans && (
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
          <PaymentPlans />
        </div>
      )}

      {/* Recent Interviews */}
      <div className="bg-[#1A1A1A] rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Recent Interviews</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 bg-[#111111] rounded-lg"
              >
                <div>
                  <h3 className="text-white font-medium">{interview.position}</h3>
                  <p className="text-sm text-gray-400">{interview.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      interview.status === 'Completed'
                        ? 'bg-green-500/10 text-green-500'
                        : interview.status === 'Scheduled'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {interview.status}
                  </span>
                  <Link
                    href={`/dashboard/interviews/${interview.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/create"
          className="group p-6 bg-[#1A1A1A] rounded-xl border border-gray-800 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-2">Create New Interview</h3>
              <p className="text-gray-400">Set up a new AI-powered interview session</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
        <Link
          href="/dashboard/settings"
          className="group p-6 bg-[#1A1A1A] rounded-xl border border-gray-800 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-2">Configure Settings</h3>
              <p className="text-gray-400">Customize your interview preferences</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
