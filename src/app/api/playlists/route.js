import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Playlist } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all playlists with their videos
    const playlists = await Playlist.find().populate('videos');
    
    return NextResponse.json({
      success: true,
      playlists
    });
  } catch (error) {
    console.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const data = await request.json();
    
    // Create new playlist
    const playlist = await Playlist.create({
      theme: data.theme,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error('Failed to create playlist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 