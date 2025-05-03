import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Check if the model already exists to prevent recompilation errors during development
const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);

export default Playlist; 