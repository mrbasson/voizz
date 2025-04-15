'use client';

import PaymentPlans from '@/app/components/PaymentPlans';

export default function PaymentPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Interview Packages</h1>
        <p className="text-gray-400 mt-2">
          Your first interview was free! Choose a plan below to continue creating interviews.
        </p>
      </div>
      
      <PaymentPlans />
    </div>
  );
}
