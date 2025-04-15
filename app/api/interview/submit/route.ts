import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      interviewId, 
      candidateName, 
      candidateEmail, 
      candidatePhone, 
      recordings,
      answers 
    } = body;

    // Validate required fields
    if (!interviewId || !candidateName || !candidateEmail || !recordings || !Array.isArray(recordings)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    const submissionsDir = path.join(dataDir, 'submissions');
    const videosDir = path.join(dataDir, 'videos');
    
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }
    
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Load the original interview data
    const interviewFilePath = path.join(dataDir, `interview-${interviewId}.json`);
    if (!fs.existsSync(interviewFilePath)) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const interviewData = JSON.parse(fs.readFileSync(interviewFilePath, 'utf8'));
    
    // Get the userId from the original interview data
    const userId = interviewData.userId || null;
    
    if (!userId) {
      console.warn(`Interview ${interviewId} has no associated user ID`);
    }
    
    // Generate a unique submission ID
    const submissionId = `${interviewId}-${Date.now()}`;
    
    // Process and save video recordings
    const videoFilePaths: (string | null)[] = [];
    for (let i = 0; i < recordings.length; i++) {
      if (recordings[i]) {
        // Extract the base64 data (remove the data:video/webm;base64, prefix)
        const base64Data = recordings[i].split(',')[1];
        
        // Create a unique filename for the video
        const videoFileName = `video-${submissionId}-q${i}.webm`;
        const videoFilePath = path.join(videosDir, videoFileName);
        
        // Save the video file
        fs.writeFileSync(videoFilePath, Buffer.from(base64Data, 'base64'));
        
        // Store the API URL path to the video
        videoFilePaths.push(`/api/videos/${videoFileName}`);
      } else {
        videoFilePaths.push(null);
      }
    }

    // Update answers with video file paths
    interface Answer {
      category: string;
      question: string;
      recordingIndex: number;
      videoPath?: string | null;
      [key: string]: any; // For any other properties in the answer object
    }
    
    const updatedAnswers = answers.map((answer: Answer) => ({
      ...answer,
      videoPath: videoFilePaths[answer.recordingIndex] || null
    }));

    // Create submission data
    const submissionData = {
      id: submissionId,
      interviewId,
      userId, // Associate the submission with the user who created the interview
      originalInterview: interviewData,
      candidate: {
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone || '',
      },
      videoFilePaths,
      answers: updatedAnswers,
      submittedAt: new Date().toISOString(),
      status: 'completed'
    };

    // Write submission data to file
    const submissionFilePath = path.join(
      submissionsDir, 
      `submission-${submissionId}.json`
    );
    
    fs.writeFileSync(
      submissionFilePath,
      JSON.stringify(submissionData, null, 2)
    );

    console.log(`Saved interview submission for ${candidateName} (${candidateEmail})`);

    return NextResponse.json({ 
      success: true,
      message: 'Interview submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting interview:', error);
    return NextResponse.json(
      { error: 'Failed to submit interview' },
      { status: 500 }
    );
  }
}
