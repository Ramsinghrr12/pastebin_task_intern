const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    const state = mongoose.connection.readyState;
    const isConnected = state === 1; // 1 = connected
    
    res.status(200).json({ ok: isConnected });
  } catch (error) {
    res.status(200).json({ ok: false });
  }
});

module.exports = router;
