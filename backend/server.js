require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./db'); // Initializes DB connection and tables

const app = express();
const PORT = process.env.PORT || 3001;

// Core Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/transactions', require('./routes/txRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'Hydra Casino API is running...' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});
