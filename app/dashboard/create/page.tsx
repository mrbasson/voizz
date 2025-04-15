'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const interviewTypes = [
  { id: 'technical', label: 'Technical', icon: '💻' },
  { id: 'behavioral', label: 'Behavioral', icon: '🤝' },
  { id: 'experience', label: 'Experience', icon: '📚' },
  { id: 'problemSolving', label: 'Problem Solving', icon: '🧩' },
  { id: 'leadership', label: 'Leadership', icon: '👥' },
  { id: 'sales', label: 'Sales', icon: '💰' },
];

const durations = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
];

export default function CreateInterview() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobPosition: '',
    jobDescription: '',
    duration: '',
    interviewTypes: [] as string[],
  });

  const toggleInterviewType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      interviewTypes: prev.interviewTypes.includes(type)
        ? prev.interviewTypes.filter(t => t !== type)
        : [...prev.interviewTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams({
      position: formData.jobPosition,
      description: formData.jobDescription,
      duration: formData.duration,
      types: formData.interviewTypes.join(','),
    });

    router.push(`/dashboard/questions?${queryParams.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-white">Create New Interview</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-300 mb-2">
            Job Position
          </label>
          <input
            type="text"
            id="jobPosition"
            placeholder="e.g. Full Stack Developer"
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.jobPosition}
            onChange={(e) => setFormData(prev => ({ ...prev, jobPosition: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-300 mb-2">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            rows={4}
            placeholder="Enter details job description"
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.jobDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
            Interview Duration
          </label>
          <select
            id="duration"
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            required
          >
            <option value="">Select Duration</option>
            {durations.map(duration => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Interview Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {interviewTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleInterviewType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  formData.interviewTypes.includes(type.id)
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
          >
            Generate Questions →
          </button>
        </div>
      </form>
    </div>
  );
}
