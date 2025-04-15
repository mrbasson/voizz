'use client';

import { useState } from 'react';
// Removing unused imports but keeping the structure for future use
import { useSearchParams } from 'next/navigation';

interface InterviewSetupForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function InterviewSetupPage() {
  const [formData, setFormData] = useState<InterviewSetupForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewLink, setInterviewLink] = useState<string | null>(null);
  
  // Keeping searchParams for potential future use but commenting out router
  const searchParams = useSearchParams();
  // const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Here we'll add the API call to create the interview link
      // For now, we'll just generate a mock link
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/interview/${uniqueId}`;
      setInterviewLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview link');
    } finally {
      setLoading(false);
    }
  };

  if (interviewLink) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-[#1A1A1A] rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Interview Link Generated!</h2>
        <div className="space-y-4">
          <p className="text-gray-300">Share this link with the candidate:</p>
          <div className="flex items-center gap-4">
            <input
              type="text"
              readOnly
              value={interviewLink}
              className="flex-1 bg-[#2A2A2A] text-white px-4 py-2 rounded-lg border border-gray-700"
            />
            <button
              onClick={() => navigator.clipboard.writeText(interviewLink)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create Interview Link</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-[#2A2A2A] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-[#2A2A2A] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-[#2A2A2A] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-[#2A2A2A] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating Link...' : 'Start Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
