const express = require('express');
const path = require('path');
const app = express();

// API routes
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Hydra API!' });
});

// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hydra running on port ${PORT}`));
