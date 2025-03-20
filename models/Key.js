const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
    key: String,
    authId: String,
    username: String,
    expiry: Date,
    isValid: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Key', keySchema);
