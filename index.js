const express = require('express');
const axios = require('axios');

const app = express();

app.get('/api/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?assetType=GamePass`;

    try {
        const response = await axios.get(url);
        const gamepasses = response.data.data;
        res.json(gamepasses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching game passes' });
    }
});

module.exports = app;
