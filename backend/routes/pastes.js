const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Paste = require('../models/Paste');
const crypto = require('crypto');

const router = express.Router();

// Generate unique ID
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// Get current time considering TEST_MODE
function getCurrentTime(req) {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms'], 10);
  }
  return Date.now();
}

// Create a paste
router.post(
  '/',
  [
    body('content')
      .notEmpty()
      .withMessage('content is required and must be a non-empty string')
      .isString()
      .withMessage('content must be a string'),
    body('ttl_seconds')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ttl_seconds must be an integer >= 1'),
    body('max_views')
      .optional()
      .isInt({ min: 1 })
      .withMessage('max_views must be an integer >= 1')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, ttl_seconds, max_views } = req.body;
      const id = generateId();
      
      // Calculate expires_at if TTL is provided
      let expires_at = null;
      if (ttl_seconds) {
        const now = getCurrentTime(req);
        expires_at = new Date(now + ttl_seconds * 1000);
      }

      const paste = new Paste({
        id,
        content,
        ttl_seconds: ttl_seconds || null,
        max_views: max_views || null,
        expires_at
      });

      await paste.save();

      // Determine base URL: use BASE_URL env var, or derive from request, or fallback to localhost
      let baseUrl = process.env.BASE_URL;
      
      if (!baseUrl) {
        // In production, use the request host
        // Check for X-Forwarded-Proto header (used by Render/proxies)
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
        const host = req.get('host') || req.get('x-forwarded-host') || `localhost:${process.env.PORT || 5000}`;
        baseUrl = `${protocol}://${host}`;
      }
      
      const url = `${baseUrl}/p/${id}`;

      res.status(201).json({
        id,
        url
      });
    } catch (error) {
      console.error('Error creating paste:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Fetch a paste (API)
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('id is required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const paste = await Paste.findOne({ id });

      if (!paste) {
        return res.status(404).json({ error: 'Paste not found' });
      }

      // Check if paste is available and atomically increment views
      const testNowMs = process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']
        ? parseInt(req.headers['x-test-now-ms'], 10)
        : null;

      // Atomically increment views if available
      const updatedPaste = await Paste.incrementViewsIfAvailable(id, testNowMs);

      if (!updatedPaste) {
        return res.status(404).json({ error: 'Paste not available' });
      }

      res.status(200).json({
        content: updatedPaste.content,
        remaining_views: updatedPaste.max_views !== null 
          ? Math.max(0, updatedPaste.max_views - updatedPaste.current_views)
          : null,
        expires_at: updatedPaste.expires_at ? updatedPaste.expires_at.toISOString() : null
      });
    } catch (error) {
      console.error('Error fetching paste:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
