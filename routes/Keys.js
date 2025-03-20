const express = require('express');
const Key = require('../models/Key');
const router = express.Router();

// Generate a key
router.post('/generate', async (req, res) => {
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
router.post('/validate', async (req, res) => {
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

module.exports = router;
