const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const issueRoutes = require('./routes/issues');

dotenv.config();


const app = express();
const port = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api', issueRoutes);

// Error Handling Middleware (Catch-all for routes not defined)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// General Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});