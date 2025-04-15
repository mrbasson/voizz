'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Define the Paystack type for TypeScript but mark as unused with a comment
// Keeping this for documentation purposes
// type PaystackType = {
//   setup: () => void;
//   open: () => void;
// };

interface PlanProps {
  title: string;
  price: number;
  features: string[];
  buttonText: string;
  onSelect: () => void;
  isSelected: boolean;
}

const Plan = ({ title, price, features, buttonText, onSelect, isSelected }: PlanProps) => (
  <div className={`bg-[#1A1A1A] p-6 rounded-xl border ${isSelected ? 'border-blue-500' : 'border-gray-800'} transition-all`}>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white mb-4">R{price}</p>
    <ul className="space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <span className="text-green-500 mr-2">✓</span>
          <span className="text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      className={`w-full py-2 rounded-lg font-medium transition-colors ${
        isSelected
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {buttonText}
    </button>
  </div>
);

export default function PaymentPlans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({
    email: '',
    amount: 0,
    plan: '',
    reference: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setPaymentInfo(prev => ({
        ...prev,
        email: user.email || '',
        reference: `voizz_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      }));
    }
  }, [user]);

  // Load Paystack script only on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if Paystack script is already loaded
      if (!document.getElementById('paystack-script')) {
        const script = document.createElement('script');
        script.id = 'paystack-script';
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Paystack script loaded successfully');
          setPaystackLoaded(true);
        };
        
        script.onerror = (error) => {
          console.error('Error loading Paystack script:', error);
          alert('Payment system could not be loaded. Please try again later.');
        };
        
        document.body.appendChild(script);
      } else {
        // Script already exists
        if (window.PaystackPop) {
          console.log('Paystack already available');
          setPaystackLoaded(true);
        } else {
          console.warn('Paystack script exists but PaystackPop is not defined');
          // Try to reload the script
          const existingScript = document.getElementById('paystack-script');
          if (existingScript) {
            existingScript.remove();
            const newScript = document.createElement('script');
            newScript.id = 'paystack-script';
            newScript.src = 'https://js.paystack.co/v1/inline.js';
            newScript.async = true;
            newScript.onload = () => {
              console.log('Paystack script reloaded successfully');
              setPaystackLoaded(true);
            };
            document.body.appendChild(newScript);
          }
        }
      }
    }
  }, []);

  const plans = [
    {
      id: 'one-time',
      title: 'One-Time Interview',
      price: 150,
      features: [
        'Single candidate interview session',
        'AI-powered feedback',
        'Resume analysis',
        'Interview recording',
      ],
    },
    {
      id: 'basic',
      title: 'Basic Package',
      price: 495,
      features: [
        '2-5 candidate interview sessions',
        'AI-powered feedback',
        'Resume analysis',
        'Interview recordings',
        'Personalized improvement tips',
      ],
    },
    {
      id: 'unlimited',
      title: 'Unlimited Package',
      price: 795,
      features: [
        'Unlimited interviews per month',
        'Priority AI feedback',
        'Advanced resume analysis',
        'Interview recordings',
        'Personalized improvement roadmap',
        'Email support',
      ],
    },
  ];

  const handleSelectPlan = (planId: string, amount: number) => {
    setSelectedPlan(planId);
    setPaymentInfo(prev => ({
      ...prev,
      amount: amount * 100, // Paystack requires amount in kobo/cents
      plan: planId,
    }));
  };

  // Define a type for the payment response
  interface PaymentResponse {
    reference: string;
    status: string;
    transaction: string;
    message?: string;
    [key: string]: any; // For any other properties that might be in the response
  }

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setIsProcessing(false);
    setPaymentStatus('success');
    console.log('Payment successful', response);
    
    // Save subscription to database
    saveSubscription({
      plan: paymentInfo.plan,
      amount: paymentInfo.amount / 100,
      paymentRef: response.reference,
      transactionId: response.transaction,
    });
  };

  const handlePaymentClose = () => {
    setIsProcessing(false);
  };

  // Add a function to verify Paystack configuration
  const verifyPaystackConfig = async () => {
    try {
      const response = await fetch('/api/verify-paystack');
      const data = await response.json();
      
      console.log('Paystack configuration check:', data);
      
      if (!data.publicKeyAvailable) {
        alert('Payment configuration error: Public key not available. Please contact support.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying Paystack configuration:', error);
      alert('Error checking payment configuration. Please try again later.');
      return false;
    }
  };

  const initiatePayment = async () => {
    if (!user || !paymentInfo.email || !paymentInfo.amount) {
      alert('Please log in to make a payment');
      return;
    }

    if (!paystackLoaded || typeof window.PaystackPop === 'undefined') {
      alert('Payment system is still loading. Please try again in a moment.');
      return;
    }

    // Verify Paystack configuration before proceeding
    const configValid = await verifyPaystackConfig();
    if (!configValid) {
      return;
    }

    // Get the Paystack public key
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    
    // Debug the key (will only show in browser console)
    console.log('Paystack key available:', !!paystackPublicKey);
    
    if (!paystackPublicKey) {
      alert('Payment configuration error. Please contact support.');
      setIsProcessing(false);
      setPaymentStatus('error');
      return;
    }

    setIsProcessing(true);

    try {
      // Use the global PaystackPop object
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: paymentInfo.email,
        amount: paymentInfo.amount,
        currency: 'ZAR',
        ref: paymentInfo.reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: paymentInfo.plan,
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user?.uid || '',
            }
          ]
        },
        callback: (response: PaymentResponse) => {
          handlePaymentSuccess(response);
        },
        onClose: () => {
          handlePaymentClose();
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setIsProcessing(false);
      setPaymentStatus('error');
    }
  };

  // Define a type for the subscription data
  interface SubscriptionData {
    plan: string;
    amount: number;
    paymentRef: string;
    transactionId?: string;
    userId?: string;
    email?: string;
  }

  const saveSubscription = async (data: SubscriptionData) => {
    try {
      // Get the current user's ID token for authentication
      const idToken = await user?.getIdToken();
      
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
      
      const result = await response.json();
      console.log('Subscription saved', result);
      
      // Refresh the page or redirect to success page
      window.location.href = '/dashboard?payment=success';
    } catch (error) {
      console.error('Error saving subscription:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Interview Package</h2>
        <p className="text-gray-400">Select the plan that best fits your interview preparation needs</p>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500 rounded-lg inline-block">
          <p className="text-blue-400 font-medium">🎉 Your first interview is always free!</p>
          <p className="text-gray-300 text-sm mt-1">
            Choose a plan below for additional interviews.
          </p>
        </div>
      </div>

      {paymentStatus === 'success' ? (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
          <h3 className="text-green-500 font-semibold text-lg mb-2">Payment Successful!</h3>
          <p className="text-gray-300 mb-4">Your subscription has been activated.</p>
          <button 
            onClick={() => window.location.href = '/dashboard/create'} 
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Interview
          </button>
        </div>
      ) : paymentStatus === 'error' ? (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
          <h3 className="text-red-500 font-semibold text-lg mb-2">Payment Error</h3>
          <p className="text-gray-300 mb-4">There was an issue processing your payment. Please try again.</p>
          <button 
            onClick={() => setPaymentStatus('idle')} 
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Plan
                key={plan.id}
                title={plan.title}
                price={plan.price}
                features={plan.features}
                buttonText={selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                onSelect={() => handleSelectPlan(plan.id, plan.price)}
                isSelected={selectedPlan === plan.id}
              />
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-8 text-center">
              <button
                onClick={initiatePayment}
                disabled={isProcessing || !user || !paystackLoaded}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </button>
              <p className="text-gray-400 mt-2 text-sm">Secure payment powered by Paystack</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
