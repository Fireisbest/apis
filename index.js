const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

let donations = 1;
const donationsFile = 'Donations.json';
let gifts = 1;
const giftsFile = 'Gifts.json';

if (fs.existsSync(donationsFile)) {
    const data = fs.readFileSync(donationsFile);
    donations = JSON.parse(data).donations;
}

if (fs.existsSync(giftsFile)) {
    const data = fs.readFileSync(giftsFile);
    gifts = JSON.parse(data).gifts;
}

// Function to save the counter to a file
const saveDonation = () => {
    fs.writeFileSync(donationsFile, JSON.stringify({ donations }));
};

const saveGift = () => {
    fs.writeFileSync(giftsFile, JSON.stringify({ gifts }));
};

app.get('/api/gamepasses/:userId/', async (req, res) => {
    const userId = req.params.userId;
    const gamesUrl = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`;

    try {
        const response = await axios.get(gamesUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.data) {
            const games = response.data.data;
            const gamePassesPromises = [];

            for (const game of games) {
                const gamePassesUrl = `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100&sortOrder=Asc`;
                const gamePassesPromise = axios.get(gamePassesUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/json'
                    }
                });

                gamePassesPromises.push(gamePassesPromise);
            }

            const gamePassesResponses = await Promise.all(gamePassesPromises);
            let allGamePasses = [];

            gamePassesResponses.forEach((gamePassesResponse) => {
                if (gamePassesResponse.data && gamePassesResponse.data.data) {
                    const gamePasses = gamePassesResponse.data.data;
                    allGamePasses = allGamePasses.concat(gamePasses);
                }
            });

            res.json({ gamePasses: allGamePasses });
        } else {
            res.status(404).json({ error: 'No games found for this user.' });
        }
    } catch (error) {
        console.error('Error fetching game passes:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching game passes' });
    }
});

app.post('/api/donations', (req, res) => {
    donations += 1;
    saveDonation();
    res.json({ donations });
});

app.post('/api/gifts', (req, res) => {
    gifts += 1;
    saveGift();
    res.json({ gifts });
});

module.exports = app;
