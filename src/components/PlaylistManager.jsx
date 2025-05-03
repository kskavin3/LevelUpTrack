'use client';

import { useState, useEffect } from 'react';

export default function PlaylistManager() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlaylist, setNewPlaylist] = useState({ theme: '' });
  const [newVideo, setNewVideo] = useState({
    title: '',
    videoId: '',
    thumbnail: '',
    playlistId: ''
  });

  // Fetch playlists and their videos
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/playlists');
      console.log(response);
      const data = await response.json();
      if (data.success) {
        setPlaylists(data.playlists);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlaylist),
      });
      const data = await response.json();
      if (data.success) {
        setNewPlaylist({ theme: '' });
        fetchPlaylists();
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create playlist');
    }
  };

  const handleCreateVideo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVideo),
      });
      const data = await response.json();
      if (data.success) {
        setNewVideo({
          title: '',
          videoId: '',
          thumbnail: '',
          playlistId: ''
        });
        fetchPlaylists();
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create video');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create Playlist Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <input
              type="text"
              value={newPlaylist.theme}
              onChange={(e) => setNewPlaylist({ theme: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Playlist
          </button>
        </form>
      </div>

      {/* Create Video Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Add New Video</h2>
        <form onSubmit={handleCreateVideo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Video ID</label>
            <input
              type="text"
              value={newVideo.videoId}
              onChange={(e) => setNewVideo({ ...newVideo, videoId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
            <input
              type="url"
              value={newVideo.thumbnail}
              onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Playlist</label>
            <select
              value={newVideo.playlistId}
              onChange={(e) => setNewVideo({ ...newVideo, playlistId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a playlist</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.theme}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Video
          </button>
        </form>
      </div>

      {/* Display Playlists and Videos */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Playlists</h2>
        {playlists.length === 0 ? (
          <p className="text-gray-500">No playlists found</p>
        ) : (
          playlists.map((playlist) => (
            <div key={playlist.id} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{playlist.theme}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlist.videos?.map((video) => (
                  <div key={video.id} className="border rounded-lg p-4">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                    <h4 className="font-semibold">{video.title}</h4>
                    <p className="text-sm text-gray-500">ID: {video.videoId}</p>
                  </div>
                ))}
              </div>
              {(!playlist.videos || playlist.videos.length === 0) && (
                <p className="text-gray-500">No videos in this playlist</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 