const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.json()); // enables reading req.body as JSON

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/needy', require('./routes/needyRoutes'));
app.use('/api/money', require('./routes/moneyRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/volunteer', require('./routes/volunteerRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Export app for Vercel
module.exports = app;
