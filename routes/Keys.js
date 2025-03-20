const express = require('express');
const Key = require('../models/Key');
const router = express.Router();

// Generate a key
router.post('/generate', (req, res) => {
    const { username, duration } = req.body;
    const key = Math.random().toString(36).substring(2, 15);
    const authId = Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + duration * 60 * 1000);

    const newKey = new Key({ key, authId, username, expiry });
    newKey.save((err) => {
        if (err) return res.status(500).json({ error: 'Failed to generate key' });
        res.json({ key, authId, expiry });
    });
});

// Validate a key
router.post('/validate', (req, res) => {
    const { key, authId } = req.body;
    Key.findOne({ key, authId }, (err, keyData) => {
        if (err || !keyData) return res.json({ valid: false });
        if (keyData.expiry < Date.now()) {
            keyData.isValid = false;
            keyData.save();
            return res.json({ valid: false, error: 'Key expired' });
        }
        res.json({ valid: true, username: keyData.username });
    });
});

module.exports = router;
