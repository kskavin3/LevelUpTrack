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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for videos
PlaylistSchema.virtual('videos', {
  ref: 'Video',
  localField: '_id',
  foreignField: 'playlistId',
  justOne: false
});

// Ensure the model isn't already defined
const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);

export default Playlist; 