// dynamic-ranking-backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');

// Helper function to get ranked users
const getRankedUsers = async () => {
    // Find all users, sort by points in descending order
    // .lean() makes the documents plain JavaScript objects, often faster for reads
    const users = await User.find({}).sort({ points: -1 }).lean();

    // Assign ranks
    let currentRank = 1;
    let prevPoints = -1; // Initialize with a value lower than any possible points
    users.forEach((user, index) => {
        if (user.points !== prevPoints) {
            currentRank = index + 1;
        }
        user.rank = currentRank;
        prevPoints = user.points;
    });
    return users;
};

// Route 1: Initialize/Seed Users (Optional - for initial setup)
// You can call this once to populate 10 users, then remove/comment out
router.post('/initialize-users', async (req, res) => {
    try {
        const initialUsernames = ["Rahul", "Kamal", "Sanak", "Priya", "Amit", "Geeta", "Mohan", "Sara", "Vikram", "Neha"];
        const usersToInsert = initialUsernames.map(name => ({ username: name, points: Math.floor(Math.random() * 100) })); // Random initial points

        // Insert many, ignore duplicates if any
        const result = await User.insertMany(usersToInsert, { ordered: false });
        res.status(201).json({ message: `${result.length} users initialized successfully.`, insertedUsers: result });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Some users already exist. Database initialized partially or already exists.' });
        }
        console.error("Error initializing users:", err);
        res.status(500).json({ message: 'Error initializing users', error: err.message });
    }
});


// Route 2: Get all users with their ranks (Leaderboard)
router.get('/users', async (req, res) => {
    try {
        const rankedUsers = await getRankedUsers();
        res.status(200).json(rankedUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// Route 3: Add a new user
router.post('/users', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    try {
        const newUser = new User({ username });
        await newUser.save();
        const rankedUsers = await getRankedUsers(); // Get updated ranking
        res.status(201).json({ message: 'User added successfully!', user: newUser, updatedRankings: rankedUsers });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Username already exists. Please choose a different one.' });
        }
        console.error("Error adding user:", err);
        res.status(500).json({ message: 'Error adding user', error: err.message });
    }
});

// Route 4: Claim points for a user
router.post('/claim-points/:userId', async (req, res) => {
    const { userId } = req.params;
    const pointsToClaim = Math.floor(Math.random() * 10) + 1; // Random points (1 to 10)

    try {
        // Find the user and update their points
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { points: pointsToClaim } }, // $inc increments the points field
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Create a claim history entry
        const claimHistory = new ClaimHistory({
            userId: user._id,
            pointsClaimed: pointsToClaim
        });
        await claimHistory.save();

        // Get the updated rankings to send back to the frontend
        const updatedRankings = await getRankedUsers();

        res.status(200).json({
            message: `Successfully claimed ${pointsToClaim} points for ${user.username}!`,
            user: user, // The updated user object
            pointsClaimed: pointsToClaim,
            updatedRankings: updatedRankings // Send back the entire updated leaderboard
        });

    } catch (err) {
        console.error("Error claiming points:", err);
        res.status(500).json({ message: 'Error claiming points', error: err.message });
    }
});

// Route 5: Get claim history for a specific user (optional, but good for completeness)
router.get('/claim-history/:userId', async (req, res) => {
    try {
        const history = await ClaimHistory.find({ userId: req.params.userId })
            .populate('userId', 'username') // Populate with username from User model
            .sort({ claimedAt: -1 }); // Sort by most recent first
        res.status(200).json(history);
    } catch (err) {
        console.error("Error fetching claim history:", err);
        res.status(500).json({ message: 'Error fetching claim history', error: err.message });
    }
});

module.exports = router;