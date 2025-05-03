import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  }
}, { 
  timestamps: true 
});

// Check if the model already exists to prevent recompilation errors during development
const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export default Video; 