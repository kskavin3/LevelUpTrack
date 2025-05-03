import { NextResponse } from 'next/server';
import { generatePlaylistIdeas } from '@/lib/anthropic';
import { createPlaylist } from '@/lib/youtube';
import connectToDatabase from '@/lib/db/connection';
import Playlist from '@/lib/models/Playlist';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation(operation) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      console.warn(`Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error('This should never be reached');
}

export async function POST(request) {
  try {
    const { theme } = await request.json();
    console.log('Received theme:', theme);

    // Connect to MongoDB
    await connectToDatabase();

    const ideas = await generatePlaylistIdeas(theme);
    console.log('Generated playlist ideas:', ideas);

    const playlist = await createPlaylist(ideas);
    console.log('Created playlist:', playlist);

    // Store the playlist in MongoDB with retry mechanism
    const savedPlaylist = await retryOperation(async () => {
      const newPlaylist = new Playlist({
        theme,
        videos: playlist.map(video => ({
          title: video.title,
          videoId: video.videoId,
          thumbnail: video.thumbnail,
        }))
      });
      return await newPlaylist.save();
    });

    console.log('Saved playlist to database:', savedPlaylist);

    return NextResponse.json(savedPlaylist);
  } catch (error) {
    console.error('Error generating playlist:', error);
    return NextResponse.json({ error: 'Failed to generate playlist' }, { status: 500 });
  }
} 