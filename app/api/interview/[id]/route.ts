import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define a type for the interview questions
interface InterviewQuestion {
  category: string;
  question: string;
  expectedDuration: number;
  difficulty: string;
}

// Store questions temporarily in memory (in production, this would be in a database)
const interviewQuestions = new Map<string, InterviewQuestion[]>();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    console.log(`Fetching interview with ID: ${interviewId}`);
    console.log(`Available interviews in memory: ${Array.from(interviewQuestions.keys()).join(', ')}`);
    
    // Get questions from the in-memory map
    let questions = interviewQuestions.get(interviewId);
    
    // If not found in memory, try to load from file
    if (!questions) {
      console.log(`Interview with ID ${interviewId} not found in memory, checking file storage`);
      
      try {
        const dataDir = path.join(process.cwd(), 'data');
        const filePath = path.join(dataDir, `interview-${interviewId}.json`);
        
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, 'utf8');
          const interviewData = JSON.parse(fileData);
          
          // Add to in-memory map for future requests
          questions = interviewData.questions as InterviewQuestion[];
          interviewQuestions.set(interviewId, questions);
          
          console.log(`Loaded interview ${interviewId} from file storage with ${questions.length} questions`);
        } else {
          console.log(`No file found for interview ${interviewId}`);
        }
      } catch (fileError) {
        console.error(`Error loading interview from file:`, fileError);
      }
    }
    
    // If questions are still not found, return 404
    if (!questions || questions.length === 0) {
      console.log(`No questions found for interview ${interviewId}`);
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }
    
    console.log(`Found interview with ID ${interviewId}, returning ${questions.length} questions`);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview questions' },
      { status: 500 }
    );
  }
}

// Export the map so it can be used by the create endpoint
export { interviewQuestions };
