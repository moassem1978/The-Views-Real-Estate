const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Basic API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://0.0.0.0:${PORT}`);
});