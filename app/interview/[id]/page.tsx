'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  category: string;
  question: string;
  expectedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideos, setRecordedVideos] = useState<string[]>([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Video recording refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoDataRef = useRef<{blob: Blob, url: string}[]>([]);
  
  // Maximum recording time in seconds (2 minutes)
  const MAX_RECORDING_TIME = 120;

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Fetch questions from the API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching interview questions for ID: ${params.id}`);
        const response = await fetch(`/api/interview/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch interview questions');
        }
        
        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('No questions found');
        }
        
        console.log('Loaded questions:', data.questions);
        setQuestions(data.questions);
        
        // Initialize recordedVideos array with empty strings
        setRecordedVideos(new Array(data.questions.length).fill(''));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchQuestions();
    
    // Cleanup function to stop any active streams when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [params.id]);

  // Start video recording
  const startRecording = async () => {
    try {
      // Start countdown
      setShowCountdown(true);
      setCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowCountdown(false);
            initializeRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please make sure your camera is connected and you have granted permission to use it.');
    }
  };
  
  // Initialize the actual recording after countdown
  const initializeRecording = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      // Display the video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      // Handle data available event
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        
        // Save the recorded video URL and blob
        setRecordedVideos(prev => {
          const newVideos = [...prev];
          newVideos[currentQuestionIndex] = videoURL;
          return newVideos;
        });

        // Store the blob for later conversion to base64
        videoDataRef.current[currentQuestionIndex] = {
          blob,
          url: videoURL
        };
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Reset recording state
        setIsRecording(false);
        setRecordingTime(0);
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error initializing recording:', err);
      setError('Failed to initialize recording. Please make sure your camera is connected and you have granted permission to use it.');
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions completed, show the candidate info form
      setIsInterviewComplete(true);
    }
  };

  // Handle candidate info input changes
  const handleCandidateInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCandidateInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit the completed interview
  const submitInterview = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate candidate info
      if (!candidateInfo.name.trim() || !candidateInfo.email.trim()) {
        setError('Please provide your name and email to complete the interview.');
        setIsSubmitting(false);
        return;
      }

      // Convert video blobs to base64 strings
      const videoBase64Promises = videoDataRef.current
        .filter(video => video && video.blob)
        .map(video => blobToBase64(video.blob));
      
      const videoBase64Data = await Promise.all(videoBase64Promises);
      
      // Prepare submission data
      const submissionData = {
        interviewId: params.id,
        candidateName: candidateInfo.name,
        candidateEmail: candidateInfo.email,
        candidatePhone: candidateInfo.phone,
        recordings: videoBase64Data,
        answers: questions.map((question, index) => ({
          question: question.question,
          category: question.category,
          recordingIndex: index
        }))
      };
      
      // Submit interview data
      const response = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit interview');
      }
      
      // Interview submitted successfully
      setIsSubmitted(true);
      setError(null);
    } catch (err) {
      console.error('Error submitting interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-400">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <div className="mt-6">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[#1A1A1A] rounded-xl border border-gray-800 p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Interview Submitted!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for completing this interview. Your responses have been recorded and will be reviewed by the recruiter.
          </p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[#1A1A1A] rounded-xl border border-gray-800 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Information</h1>
          <p className="text-gray-400 mb-6 text-center">
            Please provide your contact information to complete the interview.
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={candidateInfo.name}
                onChange={handleCandidateInfoChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#111111] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={candidateInfo.email}
                onChange={handleCandidateInfoChange}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#111111] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={candidateInfo.phone}
                onChange={handleCandidateInfoChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#111111] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={submitInterview}
                disabled={isSubmitting}
                className={`${
                  isSubmitting
                    ? 'bg-blue-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasRecordedCurrentQuestion = !!recordedVideos[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
          <h1 className="text-2xl font-bold mb-4">AI Interview Session</h1>
          
          {/* Question */}
          <div className="bg-blue-500/10 border border-blue-500/50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">
                {currentQuestion?.category || 'Loading...'}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {currentQuestion?.expectedDuration || '0'} min
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    currentQuestion?.difficulty === 'easy'
                      ? 'bg-green-500/10 text-green-500'
                      : currentQuestion?.difficulty === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {currentQuestion?.difficulty || 'medium'}
                </span>
              </div>
            </div>
            <p className="text-white text-lg">{currentQuestion?.question || 'Loading question...'}</p>
          </div>
          
          {/* Video Recording Section */}
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
            {showCountdown && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-70">
                <div className="text-6xl font-bold text-white">{countdown}</div>
              </div>
            )}
            
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse mr-2"></span>
                <span>{formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}</span>
              </div>
            )}
            
            {hasRecordedCurrentQuestion ? (
              <video 
                className="w-full aspect-video bg-black" 
                src={recordedVideos[currentQuestionIndex]} 
                controls
              />
            ) : (
              <div className="relative">
                <video 
                  ref={videoRef} 
                  className="w-full aspect-video bg-black" 
                  autoPlay 
                  muted 
                  playsInline
                />
                {!isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <p className="text-white text-lg">Press "Start Recording" to begin</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!hasRecordedCurrentQuestion ? (
              isRecording ? (
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Stop Recording
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Start Recording
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  // Clear the current recording to allow re-recording
                  setRecordedVideos(prev => {
                    const newVideos = [...prev];
                    newVideos[currentQuestionIndex] = '';
                    return newVideos;
                  });
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Record Again
              </button>
            )}
            
            <button
              onClick={nextQuestion}
              disabled={!hasRecordedCurrentQuestion}
              className={`${
                hasRecordedCurrentQuestion
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed'
              } text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-center space-x-2">
              {questions.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentQuestionIndex 
                      ? 'bg-blue-500' 
                      : index < currentQuestionIndex 
                      ? 'bg-green-500' 
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
