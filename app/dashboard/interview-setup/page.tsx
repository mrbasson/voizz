'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface InterviewSetupForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  description: string;
}

interface Question {
  category: string;
  question: string;
  expectedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Create a client component that uses the useSearchParams hook
function InterviewSetupContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<InterviewSetupForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: 'Software Developer',
    description: 'Technical interview for a software development position',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewLink, setInterviewLink] = useState<string | null>(null);
  
  // Now safely using searchParams inside a component that will be wrapped in Suspense
  const searchParams = useSearchParams();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sample questions for the interview
  const sampleQuestions: Question[] = [
    {
      category: 'Technical',
      question: 'Explain the difference between var, let, and const in JavaScript.',
      expectedDuration: 120,
      difficulty: 'medium'
    },
    {
      category: 'Problem Solving',
      question: 'How would you implement a function to check if a string is a palindrome?',
      expectedDuration: 180,
      difficulty: 'medium'
    },
    {
      category: 'Experience',
      question: 'Describe a challenging project you worked on and how you overcame obstacles.',
      expectedDuration: 150,
      difficulty: 'medium'
    }
  ];
  
  // State to store the user's auth token
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Get the user's auth token when the component mounts or user changes
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      }
    };
    
    getToken();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the interview via the API
      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          position: formData.position,
          description: formData.description,
          types: 'technical,behavioral',
          duration: '30 minutes',
          questions: sampleQuestions,
          userId: user?.uid || 'anonymous'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create interview');
      }

      const data = await response.json();
      const interviewId = data.id;

      if (!interviewId) {
        throw new Error('No interview ID returned from server');
      }

      // Generate the interview link with the actual ID
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/interview/${interviewId}`;
      setInterviewLink(link);
    } catch (err) {
      console.error('Error creating interview:', err);
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

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-400 mb-2">
              Position
            </label>
            <input
              type="text"
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handleInputChange}
              className="w-full bg-[#2A2A2A] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              required
              value={formData.description}
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

// Main page component with Suspense boundary
export default function InterviewSetupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading interview setup...</div>}>
      <InterviewSetupContent />
    </Suspense>
  );
}
