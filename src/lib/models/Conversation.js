import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  lastMessage: {
    type: String,
    required: false
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the model already exists to prevent overwriting during hot reloads
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation; 