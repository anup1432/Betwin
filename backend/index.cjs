// index.cjs
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests from any origin

// Port setup
const PORT = process.env.PORT || 5000;

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// ----------------------
// Mongoose Schemas
// ----------------------
const userSchema = new mongoose.Schema({
    username: { type: String, required: true }
});

const betSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['up', 'down'], required: true },
    result: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Bet = mongoose.model('Bet', betSchema);

// ----------------------
// Routes
// ----------------------

// Test route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Create User
app.post('/users', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const user = new User({ username });
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all Users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Place Bet
app.post('/bets', async (req, res) => {
    try {
        const { userId, amount, type } = req.body;
        if (!userId || !amount || !type) return res.status(400).json({ error: 'All fields required' });

        const bet = new Bet({ userId, amount, type });
        await bet.save();
        res.json(bet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all Bets
app.get('/bets', async (req, res) => {
    try {
        const bets = await Bet.find().populate('userId', 'username');
        res.json(bets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
