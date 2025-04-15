import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Validate filename to prevent directory traversal attacks
    if (!filename || filename.includes('..') || !filename.endsWith('.webm')) {
      return NextResponse.json(
        { error: 'Invalid video filename' },
        { status: 400 }
      );
    }
    
    // Get the video file path
    const dataDir = path.join(process.cwd(), 'data');
    const videosDir = path.join(dataDir, 'videos');
    const videoPath = path.join(videosDir, filename);
    
    // Check if the file exists
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Read the video file
    const videoBuffer = fs.readFileSync(videoPath);
    
    // Return the video file with the appropriate content type
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/webm',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error serving video:', error);
    return NextResponse.json(
      { error: 'Failed to serve video' },
      { status: 500 }
    );
  }
}
