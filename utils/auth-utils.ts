import { auth } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifies the Firebase authentication token from the request headers
 * and returns the user ID if valid.
 */
export async function verifyAuthToken(req: NextRequest): Promise<string | null> {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid authorization header found');
      return null;
    }
    
    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      console.error('No token found in authorization header');
      return null;
    }
    
    // Verify the token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    
    // Return the user ID from the token
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

/**
 * Gets the authenticated user from the request headers.
 * Returns the Firebase UID if found, otherwise returns null.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  try {
    const firebaseUid = await verifyAuthToken(req);
    
    if (!firebaseUid) {
      return null;
    }
    
    // Return a simple user object with the Firebase UID
    return {
      id: firebaseUid,
      firebaseUid
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Middleware to protect API routes that require authentication.
 * Returns the user ID if authenticated, otherwise returns a 401 response.
 */
export async function authenticateRequest(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const userId = await verifyAuthToken(req);
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return { userId };
}
