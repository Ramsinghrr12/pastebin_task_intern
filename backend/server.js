const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection (Atlas or other URI via env)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable. Please set it to your MongoDB Atlas connection string.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// API & HTML routes
app.use('/api/pastes', require('./routes/pastes'));
app.use('/api/healthz', require('./routes/healthz'));
app.use('/p', require('./routes/view'));

// Serve React frontend (built files) from ../frontend/build
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

app.use(express.static(frontendBuildPath));

// Fallback: for any non-API route that isn't /p/*, serve index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/p/')) {
    return next();
  }

  return res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
