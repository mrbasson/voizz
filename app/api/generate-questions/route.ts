import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface InterviewRequest {
  jobPosition: string;
  jobDescription: string;
  interviewTypes: string[];
  duration: string;
}

interface Question {
  category: string;
  question: string;
  expectedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionsResponse {
  questions: Question[];
}

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { jobPosition, jobDescription, interviewTypes, duration } = body as InterviewRequest;

    if (!jobPosition || !jobDescription || !Array.isArray(interviewTypes) || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating questions for:', { jobPosition, interviewTypes, duration });

    const prompt = `Generate a list of interview questions for a ${jobPosition} position.
Job Description: ${jobDescription}
Interview Types: ${interviewTypes.join(', ')}
Duration: ${duration} minutes

Please provide a structured list of questions that:
1. Are relevant to the job position and description
2. Cover all the specified interview types (${interviewTypes.join(', ')})
3. Can be reasonably answered within the ${duration} minute timeframe
4. Include a mix of technical, behavioral, and experience-based questions as appropriate
5. Are organized by category

Format the response as a JSON object with a 'questions' array. Each question should have:
- category: the type of question (technical, behavioral, etc.)
- question: the actual question text
- expectedDuration: estimated time in minutes to answer
- difficulty: easy, medium, or hard`;

    try {
      console.log('Calling OpenAI API...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer who creates well-structured, relevant interview questions. Always return a JSON object with a 'questions' array."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      console.log('OpenAI response received');

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error('OpenAI returned empty content');
        return NextResponse.json(
          { error: 'Failed to generate questions - empty response' },
          { status: 500 }
        );
      }

      try {
        const response = JSON.parse(content) as QuestionsResponse;
        
        if (!response.questions || !Array.isArray(response.questions)) {
          console.error('Invalid response format from OpenAI:', content);
          return NextResponse.json(
            { error: 'Invalid question format received' },
            { status: 500 }
          );
        }

        console.log('Successfully generated', response.questions.length, 'questions');

        return NextResponse.json({
          questions: response.questions
        });
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError, 'Content:', content);
        return NextResponse.json(
          { error: 'Failed to parse generated questions' },
          { status: 500 }
        );
      }
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError.message, openaiError.status);
      return NextResponse.json(
        { error: `Failed to generate questions - ${openaiError.message}` },
        { status: openaiError.status || 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
