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
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

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

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/keys', require('./routes/keys'));
app.use('/users', require('./routes/users'));

// Serve the dashboard
app.use(express.static('dashboard'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
