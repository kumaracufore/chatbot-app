import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: Number,
    required: true,
    unique: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  totalConversation: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active',
  },
  flagStatus: {
    type: String,
    enum: ['pending', 'incomplete', 'complete'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
