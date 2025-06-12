#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create a simple production server
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from public directory
app.use(express.static('public'));

// Serve the status page
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'status.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'The Views Real Estate - Production Server Running'
  });
});

// Serve main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`🌐 Access at: http://0.0.0.0:${PORT}`);
  console.log(`🔗 Status page: http://0.0.0.0:${PORT}/status`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
});