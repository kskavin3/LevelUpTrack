import { NextResponse } from 'next/server';
import { generatePlaylistIdeas } from '@/lib/anthropic';
import { createPlaylist } from '@/lib/youtube';
import connectToDatabase from '@/lib/db/connection';
import { Playlist, Video } from '@/lib/models';

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

// Helper function to clean response data
function cleanResponseData(playlist) {
  // Clean playlist object
  const cleanPlaylist = {
    id: playlist._id.toString(),
    theme: playlist.theme,
    videos: playlist.videos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      videoId: video.videoId,
      thumbnail: video.thumbnail
    }))
  };
  
  return cleanPlaylist;
}

export async function POST(request) {
  try {
    const { theme } = await request.json();
    console.log('Received theme:', theme);

    // Connect to MongoDB
    await connectToDatabase();

    const ideas = await generatePlaylistIdeas(theme);
    console.log('Generated playlist ideas:', ideas);

    const videoData = await createPlaylist(ideas);
    console.log('Created playlist:', videoData);

    // Store the playlist and videos in MongoDB with retry mechanism
    const result = await retryOperation(async () => {
      // First create the playlist
      const newPlaylist = new Playlist({
        theme
      });
      const savedPlaylist = await newPlaylist.save();
      console.log('Saved playlist to database:', savedPlaylist);
      
      // Then create all videos with references to the playlist
      const videoPromises = videoData.map(video => {
        const newVideo = new Video({
          title: video.title,
          videoId: video.videoId,
          thumbnail: video.thumbnail,
          playlistId: savedPlaylist._id // Set the reference to the playlist
        });
        return newVideo.save();
      });
      
      const savedVideos = await Promise.all(videoPromises);
      console.log('Saved videos to database:', savedVideos);
      
      // Return combined result with playlist populated with videos
      const populatedPlaylist = await Playlist.findById(savedPlaylist._id).populate('videos');
      return populatedPlaylist;
    });

    console.log('Final result with populated videos:', result);

    // Clean the response data before sending it
    const cleanedResponse = cleanResponseData(result);

    return NextResponse.json(cleanedResponse);
  } catch (error) {
    console.error('Error generating playlist:', error);
    return NextResponse.json({ error: 'Failed to generate playlist' }, { status: 500 });
  }
}