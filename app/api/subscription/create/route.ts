import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/firebase/admin';

const prisma = new PrismaClient();
const auth = getAuth(app);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { plan, amount, paymentRef, transactionId } = data;
    
    // Get the current user from Firebase Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { subscription: true },
    });
    
    if (!user) {
      // Create user if not exists
      const firebaseUser = await auth.getUser(firebaseUid);
      user = await prisma.user.create({
        data: {
          email: firebaseUser.email || '',
          firebaseUid,
        },
        include: { subscription: true },
      });
    }
    
    // Calculate subscription details based on plan
    const now = new Date();
    let endDate;
    let interviewsRemaining;
    
    switch (plan) {
      case 'one-time':
        // One-time plan doesn't expire but has 1 interview
        interviewsRemaining = 1;
        break;
      case 'basic':
        // Basic plan gives 5 interviews
        interviewsRemaining = 5;
        break;
      case 'unlimited':
        // Unlimited plan expires after 30 days
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);
        break;
    }
    
    // Create or update subscription
    if (user.subscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan,
          status: 'active',
          startDate: now,
          endDate,
          paymentRef,
          transactionId,
          amount: parseFloat(amount.toString()),
          interviewsRemaining,
        },
      });
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          plan,
          status: 'active',
          startDate: now,
          endDate,
          paymentRef,
          transactionId,
          amount: parseFloat(amount.toString()),
          interviewsRemaining,
          user: {
            connect: { id: user.id },
          },
        },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
