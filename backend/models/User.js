// dynamic-ranking-backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures usernames are unique
        trim: true    // Removes whitespace from beginning/end
    },
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('User', userSchema);