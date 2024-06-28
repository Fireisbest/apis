const express = require('express');
const axios = require('axios');

const app = express();

app.get('/api/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const url = `https://www.roblox.com/users/inventory/list-json?assetTypeId=34&cursor=&itemsPerPage=100&pageNumber=%s&userId=${userId}`;

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
module.exports = (req, res) => app(req, res); // Ensures compatibility with Vercel
