export async function searchYouTube(searchQuery) {
    console.log(`[searchYouTube] Starting search for: "${searchQuery}"`);
    searchQuery = searchQuery.replaceAll(" ", "+");
    console.log(`[searchYouTube] Encoded search query: "${searchQuery}"`);
    console.count("youtube search");
    try {
        console.log(`[searchYouTube] Preparing to fetch from YouTube API`);
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`;
        console.log(`[searchYouTube] API URL: ${apiUrl}`);
        const response = await fetch(apiUrl, { method: "GET" });
        console.log(`[searchYouTube] YouTube API response status: ${response.status}`);
        
        if (!response.ok) {
            console.error(`[searchYouTube] API request failed with status ${response.status}`);
            throw new Error(`YouTube API returned status ${response.status}`);
        }
        
        console.log(`[searchYouTube] Parsing API response`);
        const json = await response.json();
        console.log(`[searchYouTube] API response parsed successfully`);
        
        if (!json || !json.items || json.items.length === 0) {
            console.warn("[searchYouTube] YouTube API returned no items");
            return null;
        }
        
        const videoId = json.items[0].id.videoId;
        console.log(`[searchYouTube] Found video ID: ${videoId}`);
        return videoId;
    } catch (error) {
        console.error("[searchYouTube] Error occurred:", error);
        return null;
    }
}

export async function createPlaylist(ideas) {
    console.log(`[createPlaylist] Starting playlist creation with ${ideas.length} ideas`);
    const playlist = [];

    for (let i = 0; i < ideas.length; i++) {
        const idea = ideas[i];
        console.log(`[createPlaylist] Processing idea ${i + 1}/${ideas.length}: "${idea}"`);
        console.log(`[createPlaylist] Searching for video: "${idea}"`);
        const videoId = await searchYouTube(idea);
        if (videoId) {
            console.log(`[createPlaylist] Video found for "${idea}" (ID: ${videoId})`);
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/default.jpg`;
            console.log(`[createPlaylist] Thumbnail URL: ${thumbnailUrl}`);
            playlist.push({
                title: idea,
                videoId: videoId,
                thumbnail: thumbnailUrl,
            });
            console.log(`[createPlaylist] Added video to playlist: "${idea}" (${videoId})`);
        } else {
            console.warn(`[createPlaylist] No video found for: "${idea}"`);
        }
    }

    console.log(`[createPlaylist] Playlist creation completed. Total videos: ${playlist.length}`);
    return playlist;
} 