'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Submission {
  id: string;
  interviewId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  submittedAt: string;
  status: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // If user is not authenticated, don't fetch submissions
        if (!user) {
          setSubmissions([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        
        // Get the user's ID token
        const token = await user.getIdToken();
        
        const response = await fetch('/api/interview/submissions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
        
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [user]);

  const viewSubmission = async (id: string) => {
    try {
      // If user is not authenticated, don't fetch submission
      if (!user) {
        setError('You must be logged in to view submissions');
        return;
      }

      setLoading(true);
      
      // Get the user's ID token
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/interview/submissions?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch submission details');
      }
      
      const data = await response.json();
      setSelectedSubmission(data.submission);
      setViewingSubmission(true);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading && !viewingSubmission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error && !viewingSubmission) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (viewingSubmission && selectedSubmission) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => {
              setViewingSubmission(false);
              setSelectedSubmission(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Submissions
          </button>
          <h1 className="text-2xl font-bold text-white">Interview Submission</h1>
        </div>

        {/* Candidate Information */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Candidate Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p className="text-white">{selectedSubmission.candidate.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white">{selectedSubmission.candidate.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Phone</p>
              <p className="text-white">{selectedSubmission.candidate.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Submitted On</p>
              <p className="text-white">{formatDate(selectedSubmission.submittedAt)}</p>
            </div>
          </div>
        </div>

        {/* Position Information */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Position Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Position</p>
              <p className="text-white">{selectedSubmission.originalInterview.position}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Interview Types</p>
              <p className="text-white">{selectedSubmission.originalInterview.types}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-400 text-sm">Description</p>
              <p className="text-white">{selectedSubmission.originalInterview.description}</p>
            </div>
          </div>
        </div>

        {/* Interview Answers */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Interview Responses</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {selectedSubmission.answers.map((answer: any, index: number) => (
                <div key={index} className="bg-[#111111] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">
                      {answer.category}
                    </span>
                    <span className="text-sm text-gray-400">Question {index + 1}</span>
                  </div>
                  <p className="text-white mb-4">{answer.question}</p>
                  {answer.videoPath && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">Candidate's Response:</p>
                      <video 
                        className="w-full aspect-video bg-black rounded-lg" 
                        src={answer.videoPath}
                        controls
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Interview Submissions</h1>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-8 text-center">
          <p className="text-gray-400">No interview submissions yet.</p>
          <p className="text-gray-400 mt-2">
            Create an interview and share the link with candidates to get started.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create New Interview
          </Link>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-[#111111]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{submission.candidateName}</div>
                        <div className="text-sm text-gray-400">{submission.candidateEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{submission.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatDate(submission.submittedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewSubmission(submission.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
