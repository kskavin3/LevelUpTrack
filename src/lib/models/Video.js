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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure the model isn't already defined
const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export default Video; 