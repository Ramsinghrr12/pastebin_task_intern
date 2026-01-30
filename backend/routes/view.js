const express = require('express');
const Paste = require('../models/Paste');

const router = express.Router();

// Get current time considering TEST_MODE
function getCurrentTime(req) {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms'], 10);
  }
  return Date.now();
}

// View a paste (HTML)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paste = await Paste.findOne({ id });

    if (!paste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paste Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1>404 - Paste Not Found</h1>
          <p>The paste you're looking for doesn't exist or has expired.</p>
        </body>
        </html>
      `);
    }

    // Atomically check availability and increment views
    const testNowMs = process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']
      ? parseInt(req.headers['x-test-now-ms'], 10)
      : null;

    // Atomically increment views if available
    const updatedPaste = await Paste.incrementViewsIfAvailable(id, testNowMs);

    if (!updatedPaste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paste Unavailable</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1>404 - Paste Unavailable</h1>
          <p>This paste has expired or reached its view limit.</p>
        </body>
        </html>
      `);
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }

    const escapedContent = escapeHtml(paste.content);
    const formattedContent = escapedContent.replace(/\n/g, '<br>');

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paste - ${id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .content {
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          .header {
            margin-bottom: 20px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Paste #${id}</h1>
          </div>
          <div class="content">${formattedContent}</div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error viewing paste:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1>500 - Internal Server Error</h1>
        <p>An error occurred while loading the paste.</p>
      </body>
      </html>
    `);
  }
});

module.exports = router;
