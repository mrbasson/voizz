import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/firebase/admin';

const prisma = new PrismaClient();
const auth = getAuth(app);

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Firebase Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { 
        interviews: {
          select: {
            id: true
          }
        },
        subscription: true
      },
    });
    
    if (!user) {
      return NextResponse.json({ count: 0, hasSubscription: false });
    }
    
    return NextResponse.json({ 
      count: user.interviews.length,
      hasSubscription: !!user.subscription,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error getting interview count:', error);
    return NextResponse.json({ error: 'Failed to get interview count' }, { status: 500 });
  }
}
