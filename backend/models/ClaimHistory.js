// dynamic-ranking-backend/models/ClaimHistory.js
const mongoose = require('mongoose');

const claimHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User', // Refers to the 'User' model
        required: true
    },
    pointsClaimed: {
        type: Number,
        required: true
    },
    claimedAt: {
        type: Date,
        default: Date.now // Automatically sets the current date/time
    }
}, { timestamps: true }); // Adds createdAt and updatedAt for this history entry

module.exports = mongoose.model('ClaimHistory', claimHistorySchema);