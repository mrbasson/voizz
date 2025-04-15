'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Question {
  category: string;
  question: string;
  expectedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionsResponse {
  questions: Question[];
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingInterview, setCreatingInterview] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewLink, setInterviewLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isFirstInterview, setIsFirstInterview] = useState(false);
  const [showFirstInterviewMessage, setShowFirstInterviewMessage] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const position = searchParams.get('position');
        const description = searchParams.get('description');
        const types = searchParams.get('types');
        const duration = searchParams.get('duration');

        if (!position || !description || !types || !duration) {
          throw new Error('Missing required parameters');
        }

        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobPosition: position,
            jobDescription: description,
            interviewTypes: types.split(','),
            duration: duration,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid response format');
        }

        setQuestions(data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchParams]);

  const handleCreateInterviewLink = async () => {
    try {
      setCreatingInterview(true);
      const position = searchParams.get('position');
      const description = searchParams.get('description');
      const types = searchParams.get('types');
      const duration = searchParams.get('duration');

      // Get or create a user ID from localStorage as fallback
      let userId = localStorage.getItem('voizz_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('voizz_user_id', userId);
      }
      
      // Set up headers with authentication if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Try to get Firebase auth token if user is logged in
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers['Authorization'] = `Bearer ${idToken}`;
          console.log('Using Firebase authentication');
        } catch (authError) {
          console.error('Error getting auth token:', authError);
          // Continue with localStorage userId as fallback
        }
      } else {
        console.log('User not authenticated, using localStorage fallback');
      }
      
      console.log('Creating interview with position:', position);
      
      // Create a new interview
      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          position,
          description,
          types,
          duration,
          questions, // Pass the generated questions to the create endpoint
          userId     // Pass the user ID for tracking interviews as fallback
        }),
      });

      if (!response.ok) {
        // Clone the response before trying to read its body
        const responseClone = response.clone();
        
        try {
          const errorData = await response.json();
          console.error('API Error Details:', errorData);
          
          // If subscription is required, redirect to payment page
          if (errorData.needsSubscription) {
            router.push('/dashboard/payment');
            return;
          }
          
          throw new Error(`Failed to create interview: ${errorData.message || response.statusText}`);
        } catch (parseError) {
          // If we can't parse the JSON, use the cloned response to get the text
          try {
            const responseText = await responseClone.text();
            console.error('API Error Response Text:', responseText);
          } catch (textError) {
            console.error('Could not read response text:', textError);
          }
          throw new Error(`Failed to create interview: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Interview created successfully:', data);
      
      // Store the interview ID and generate the shareable link
      setInterviewId(data.id);
      
      // Check if this was the first interview
      if (data.isFirstInterview) {
        setIsFirstInterview(true);
        setShowFirstInterviewMessage(true);
        
        // If this is the first interview and the API indicates they'll need a subscription next,
        // show the subscription popup
        if (data.needsSubscriptionForNext) {
          setShowSubscriptionPopup(true);
        }
      }
      
      // Create the full interview URL (using window.location to get the base URL)
      const baseUrl = window.location.origin;
      const interviewUrl = `${baseUrl}/interview/${data.id}`;
      setInterviewLink(interviewUrl);
    } catch (err) {
      console.error('Error creating interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to create interview');
    } finally {
      setCreatingInterview(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (interviewLink) {
      navigator.clipboard.writeText(interviewLink)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
        });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Generating interview questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8">
        <p>No questions generated. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Generated Interview Questions</h1>
        <p className="text-gray-400">
          Position: {searchParams.get('position')}
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">
                {question.category}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {question.expectedDuration} min
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    question.difficulty === 'easy'
                      ? 'bg-green-500/10 text-green-500'
                      : question.difficulty === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {question.difficulty}
                </span>
              </div>
            </div>
            <p className="text-white">{question.question}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {!interviewLink ? (
          <button
            onClick={handleCreateInterviewLink}
            disabled={creatingInterview}
            className={`${
              creatingInterview
                ? 'bg-blue-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`}
          >
            {creatingInterview ? 'Creating Interview...' : 'Create Interview Link'}
          </button>
        ) : (
          <div className="w-full max-w-lg bg-[#1A1A1A] rounded-xl border border-gray-800 p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Interview Link Created!</h3>
            
            {showFirstInterviewMessage && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
                <p className="text-green-400 font-medium">🎉 Your first interview is free!</p>
                <p className="text-gray-300 text-sm mt-1">
                  For additional interviews, you'll need to select a payment plan.
                </p>
              </div>
            )}
            
            <p className="text-gray-400 mb-4">Share this link with your candidate:</p>
            
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={interviewLink}
                readOnly
                className="flex-1 px-4 py-2 rounded-l-lg border border-gray-700 bg-[#111111] text-white focus:outline-none"
              />
              <button
                onClick={copyLinkToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex justify-between">
              {isFirstInterview ? (
                <button
                  onClick={() => router.push('/dashboard/payment')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View Payment Plans
                </button>
              ) : (
                <button
                  onClick={() => {
                    setInterviewId(null);
                    setInterviewLink(null);
                    setShowFirstInterviewMessage(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Create Another
                </button>
              )}
              
              <button
                onClick={() => {
                  if (interviewId) {
                    router.push(`/interview/${interviewId}`);
                  }
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Preview Interview →
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Subscription Popup */}
      {showSubscriptionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Create More Interviews?</h3>
            <p className="text-gray-300 mb-4">
              You've used your free interview! Choose a subscription plan to continue creating interviews.
            </p>
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3 mb-4">
              <p className="text-blue-400 text-sm">
                Your first interview is free. For additional interviews, you'll need to select a payment plan.
              </p>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowSubscriptionPopup(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Later
              </button>
              <button
                onClick={() => {
                  setShowSubscriptionPopup(false);
                  router.push('/dashboard/payment');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
