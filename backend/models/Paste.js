const mongoose = require('mongoose');

const pasteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  ttl_seconds: {
    type: Number,
    default: null
  },
  max_views: {
    type: Number,
    default: null
  },
  current_views: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    default: null
  }
});

// Method to check if paste is available
pasteSchema.methods.isAvailable = function(testNowMs) {
  const now = testNowMs ? new Date(testNowMs) : new Date();
  
  // Check TTL expiry
  if (this.expires_at && now >= this.expires_at) {
    return false;
  }
  
  // Check view limit
  if (this.max_views !== null && this.current_views >= this.max_views) {
    return false;
  }
  
  return true;
};

// Static method to atomically increment views and check availability
pasteSchema.statics.incrementViewsIfAvailable = async function(id, testNowMs) {
  const now = testNowMs ? new Date(testNowMs) : new Date();
  
  // Build query conditions for atomic update
  // Paste must exist, not be expired, and not exceed view limit
  const conditions = { 
    id: id,
    $and: [
      // Not expired: either no expiry, or expiry is in the future
      {
        $or: [
          { expires_at: { $exists: false } },
          { expires_at: null },
          { expires_at: { $gt: now } }
        ]
      },
      // Within view limit: either no limit, or current views < max views
      {
        $or: [
          { max_views: { $exists: false } },
          { max_views: null },
          { $expr: { $lt: ['$current_views', '$max_views'] } }
        ]
      }
    ]
  };
  
  // Atomically increment views only if all conditions are met
  const updatedPaste = await this.findOneAndUpdate(
    conditions,
    { $inc: { current_views: 1 } },
    { new: true }
  );
  
  return updatedPaste;
};

module.exports = mongoose.model('Paste', pasteSchema);
