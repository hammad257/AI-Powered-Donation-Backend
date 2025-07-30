const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.json()); // 👈 THIS enables reading req.body as JSON

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // if using this already
app.use('/api/needy', require('./routes/needyRoutes'))
app.use('/api/money', require('./routes/moneyRoutes'))
app.use('/api/food', require('./routes/foodRoutes'))
app.use('/api/volunteer', require('./routes/volunteerRoutes'))
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
