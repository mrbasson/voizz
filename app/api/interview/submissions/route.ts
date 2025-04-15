import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/firebase/admin';

// Get all submissions
export async function GET(request: NextRequest) {
  try {
    // Check if we're requesting a specific submission by ID
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    
    // Get the Firebase UID from the authorization header
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    // Extract and verify the token
    try {
      const token = authHeader.split('Bearer ')[1];
      const auth = getAuth(app);
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid user ID' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 401 }
      );
    }
    
    if (idParam) {
      return getSubmissionById(idParam, userId);
    }
    
    // Get all interview submissions
    const dataDir = path.join(process.cwd(), 'data');
    const submissionsDir = path.join(dataDir, 'submissions');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
      return NextResponse.json({ submissions: [] });
    }

    // Read all submission files
    const submissionFiles = fs.readdirSync(submissionsDir)
      .filter(file => file.startsWith('submission-') && file.endsWith('.json'));

    const submissions = [];
    
    // Filter submissions by the authenticated user's ID
    for (const file of submissionFiles) {
      try {
        const filePath = path.join(submissionsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const submission = JSON.parse(fileContent);
        
        // Only include submissions where the interview was created by the current user
        if (submission.originalInterview && submission.originalInterview.userId === userId) {
          submissions.push({
            id: file.replace('submission-', '').replace('.json', ''),
            interviewId: submission.interviewId,
            candidateName: submission.candidate.name,
            candidateEmail: submission.candidate.email,
            candidatePhone: submission.candidate.phone,
            position: submission.originalInterview.position,
            submittedAt: submission.submittedAt,
            status: submission.status
          });
        }
      } catch (error) {
        console.error(`Error processing submission file ${file}:`, error);
        // Continue with other files
      }
    }

    // Sort by submission date (newest first)
    submissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching interview submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview submissions' },
      { status: 500 }
    );
  }
}

// Helper function to get a submission by ID
async function getSubmissionById(submissionId: string, userId: string) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const submissionsDir = path.join(dataDir, 'submissions');
    
    // Find the submission file
    const submissionFiles = fs.readdirSync(submissionsDir)
      .filter(file => file.includes(submissionId) && file.endsWith('.json'));
    
    if (submissionFiles.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Read the submission file
    const filePath = path.join(submissionsDir, submissionFiles[0]);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const submission = JSON.parse(fileContent);
    
    // Verify that the submission belongs to the authenticated user
    if (submission.originalInterview && submission.originalInterview.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - You do not have permission to view this submission' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error fetching interview submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview submission' },
      { status: 500 }
    );
  }
}
