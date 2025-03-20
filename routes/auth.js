const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;
