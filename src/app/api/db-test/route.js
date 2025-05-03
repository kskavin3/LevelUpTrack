import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db/connection';
import { Playlist, Video } from '../../../lib/models';

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Check connection status
    const connectionState = {
      readyState: 0,
      states: ['disconnected', 'connected', 'connecting', 'disconnecting']
    };
    
    connectionState.readyState = 
      typeof Playlist.db !== 'undefined' ? 
      Playlist.db.readyState : 
      0;

    // Count documents in collections
    const playlistCount = await Playlist.countDocuments();
    const videoCount = await Video.countDocuments();

    return NextResponse.json({
      success: true,
      connection: {
        status: connectionState.states[connectionState.readyState],
        readyState: connectionState.readyState
      },
      collections: {
        playlists: playlistCount,
        videos: videoCount
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Create a sample playlist
    const playlist = await Playlist.create({
      theme: 'Sample Theme ' + new Date().toISOString()
    });
    
    // Create a sample video for the playlist
    const video = await Video.create({
      title: 'Sample Video',
      videoId: 'sample123',
      thumbnail: 'https://example.com/thumbnail.jpg',
      playlistId: playlist._id
    });
    
    return NextResponse.json({
      success: true,
      data: {
        playlist,
        video
      }
    });
  } catch (error) {
    console.error('Sample data creation failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 