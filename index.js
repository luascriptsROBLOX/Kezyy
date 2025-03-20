require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the application if MongoDB connection fails
    });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

// User model
const User = require('./models/User');
const Key = require('./models/Key');

// Passport Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Save or retrieve user from the database
    User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) return done(err);
        if (!user) {
            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            });
            newUser.save((err) => done(err, newUser));
        } else {
            done(null, user);
        }
    });
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get('/', (req, res) => {
    res.send('Key System Backend is running!');
});

// Google OAuth login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/dashboard');
});

// Generate a key
app.post('/generate-key', async (req, res) => {
    try {
        const { username, duration } = req.body;

        if (!username || !duration) {
            return res.status(400).json({ error: 'Username and duration are required' });
        }

        const key = Math.random().toString(36).substring(2, 15);
        const authId = Math.random().toString(36).substring(2, 15);
        const expiry = new Date(Date.now() + duration * 60 * 1000);

        const newKey = new Key({ key, authId, username, expiry });
        await newKey.save();

        res.json({ key, authId, expiry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate key' });
    }
});

// Validate a key
app.post('/validate-key', async (req, res) => {
    try {
        const { key, authId } = req.body;

        if (!key || !authId) {
            return res.status(400).json({ error: 'Key and Auth ID are required' });
        }

        const keyData = await Key.findOne({ key, authId });

        if (!keyData) {
            return res.json({ valid: false, error: 'Invalid key or Auth ID' });
        }

        if (keyData.expiry < Date.now()) {
            keyData.isValid = false;
            await keyData.save();
            return res.json({ valid: false, error: 'Key expired' });
        }

        res.json({ valid: true, username: keyData.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to validate key' });
    }
});

// Serve the dashboard
app.use(express.static('dashboard'));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
