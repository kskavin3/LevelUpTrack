import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Video } from '@/lib/models';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    // Create new video
    const video = await Video.create({
      title: data.title,
      videoId: data.videoId,
      thumbnail: data.thumbnail,
      playlistId: data.playlistId
    });
    
    return NextResponse.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Failed to create video:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 