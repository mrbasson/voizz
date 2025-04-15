import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Paystack public key is available
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const paystackSecretKeyAvailable = !!process.env.PAYSTACK_SECRET_KEY;
    
    // Return status without exposing the actual keys
    return NextResponse.json({
      publicKeyAvailable: !!paystackPublicKey,
      publicKeyPrefix: paystackPublicKey ? paystackPublicKey.substring(0, 6) + '...' : null,
      secretKeyAvailable: paystackSecretKeyAvailable,
      message: 'Paystack configuration check'
    });
  } catch (error) {
    console.error('Error checking Paystack configuration:', error);
    return NextResponse.json(
      { error: 'Failed to check Paystack configuration' },
      { status: 500 }
    );
  }
}
