import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { interviewQuestions } from '../[id]/route';
import fs from 'fs';
import path from 'path';
import { getAuth, Auth } from 'firebase-admin/auth';
import { App } from 'firebase-admin/app';
import { app } from '@/firebase/admin';

// Initialize Firebase Auth with error handling
let auth: Auth | null = null;
try {
  auth = getAuth(app);
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
}

// Fallback in-memory storage for tracking interviews if database operations fail
const userInterviews = new Map<string, number>();

export async function POST(req: Request) {
  try {
    console.log('Interview create API called');
    
    // Parse the request body
    const body = await req.json();
    
    const { position, description, types, duration, questions, userId: clientUserId } = body;
    
    // Validate required fields
    if (!questions || !Array.isArray(questions)) {
      console.log('Questions validation failed');
      return NextResponse.json(
        { error: 'Questions are required' },
        { status: 400 }
      );
    }
    
    // Default values
    let isFirstInterview = true;
    let userId = clientUserId || null;
    let firebaseUid = null;
    let userEmail = null;
    
    // Try to authenticate the user with Firebase if auth is available
    if (auth) {
      try {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split('Bearer ')[1];
          const decodedToken = await auth.verifyIdToken(token);
          firebaseUid = decodedToken.uid;
          userEmail = decodedToken.email || null;
          userId = firebaseUid; // Use Firebase UID as the user ID
          
          console.log(`Authenticated user with Firebase UID: ${firebaseUid}`);
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        // Continue with client-provided userId as fallback
      }
    }
    
    // Use file-based approach to check if this is the user's first interview
    if (firebaseUid) {
      try {
        // Check if the user has existing interviews in the file system
        const dataDir = path.join(process.cwd(), 'data');
        if (fs.existsSync(dataDir)) {
          // Get all interview files
          const files = fs.readdirSync(dataDir)
            .filter(file => file.startsWith('interview-') && file.endsWith('.json'));
          
          // Count interviews belonging to this user
          let userInterviewCount = 0;
          for (const file of files) {
            try {
              const filePath = path.join(dataDir, file);
              const fileContent = fs.readFileSync(filePath, 'utf8');
              const interviewData = JSON.parse(fileContent);
              
              if (interviewData.userId === firebaseUid) {
                userInterviewCount++;
              }
            } catch (fileError) {
              console.error(`Error reading interview file ${file}:`, fileError);
            }
          }
          
          isFirstInterview = userInterviewCount === 0;
          console.log(`User ${firebaseUid} has ${userInterviewCount} interviews. Is first interview: ${isFirstInterview}`);
          
          // For simplicity, let's allow all interviews for now
          // You can implement subscription checks later
        }
      } catch (error) {
        console.error('Error checking user interviews:', error);
        // Fall back to in-memory tracking
        const interviewCount = userInterviews.get(firebaseUid) || 0;
        isFirstInterview = interviewCount === 0;
        
        if (!isFirstInterview) {
          // For simplicity, let's allow all interviews for now
          // You can implement subscription checks later
        }
        
        userInterviews.set(firebaseUid, interviewCount + 1);
      }
    } else if (clientUserId) {
      // If no Firebase auth, fall back to client-side userId tracking
      const interviewCount = userInterviews.get(clientUserId) || 0;
      isFirstInterview = interviewCount === 0;
      
      // For simplicity, let's allow all interviews for now
      // You can implement subscription checks later
      
      userInterviews.set(clientUserId, interviewCount + 1);
    }

    // Generate a unique ID for the interview
    const interviewId = randomUUID();
    console.log(`Generated interview ID: ${interviewId}`);
    
    // Store the questions in the map (in-memory storage)
    interviewQuestions.set(interviewId, questions);
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create a simplified version of the interview data to store
    const interviewData = {
      id: interviewId,
      position: position || '',
      description: description || '',
      types: types || '',
      duration: duration || '',
      userId: userId || '',
      questions: questions.map(q => ({
        category: q.category || '',
        question: q.question || '',
        expectedDuration: q.expectedDuration || 0,
        difficulty: q.difficulty || 'medium'
      })),
      createdAt: new Date().toISOString()
    };
    
    // Write interview data to file
    try {
      fs.writeFileSync(
        path.join(dataDir, `interview-${interviewId}.json`),
        JSON.stringify(interviewData, null, 2)
      );
      console.log('Successfully wrote interview data to file');
    } catch (fileError) {
      console.error('Error writing to file:', fileError);
      // Continue even if file write fails
    }
    
    console.log(`Created interview ${interviewId} with ${questions.length} questions. First interview: ${isFirstInterview}`);
    
    // Return the interview ID and whether this was the first interview
    return NextResponse.json({ 
      id: interviewId, 
      isFirstInterview,
      needsSubscriptionForNext: isFirstInterview // Flag to indicate that the user will need a subscription for the next interview
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    // Include more details in the error response
    return NextResponse.json(
      { 
        error: 'Failed to create interview', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
