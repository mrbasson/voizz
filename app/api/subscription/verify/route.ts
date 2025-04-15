import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { reference } = data;
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }
    
    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
    }
    
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const verifyData = await verifyResponse.json();
    
    if (!verifyResponse.ok || !verifyData.status) {
      return NextResponse.json({ 
        error: 'Payment verification failed', 
        details: verifyData 
      }, { status: 400 });
    }
    
    // Payment is verified, update subscription status if needed
    const transaction = verifyData.data;
    
    if (transaction.status === 'success') {
      // Find subscription by payment reference
      const subscription = await prisma.subscription.findFirst({
        where: { paymentRef: reference }
      });
      
      if (subscription) {
        // Update subscription with transaction details
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'active',
            transactionId: transaction.id.toString(),
          }
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified successfully',
        data: {
          amount: transaction.amount / 100,
          currency: transaction.currency,
          transactionDate: transaction.paid_at,
          status: transaction.status
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment not successful',
        status: transaction.status
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
