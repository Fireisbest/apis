const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

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
    const gamesUrl = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=10&sortOrder=Asc`;

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
                const gamePassesUrl = `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=10&sortOrder=Asc`;
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

app.get('/api/dononotif', async (req, res) => {
    const { username1, username2, amount } = req.query;

    if (!username1 || !username2 || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const canvas = createCanvas(1440, 512);
    const ctx = canvas.getContext('2d');

    // Load base image
    const baseImage = await loadImage('/mnt/data/image.png');
    ctx.drawImage(baseImage, 0, 0, 1440, 512);

    // Add custom text
    ctx.font = 'bold 60px Sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    ctx.fillText(`@${username1}`, 270, 420); // Left username
    ctx.fillText(`@${username2}`, 1170, 420); // Right username

    ctx.font = 'bold 100px Sans-serif';
    ctx.fillStyle = '#FF00FF';
    ctx.fillText(amount, 720, 280); // Amount

    // Send image as response
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
});

module.exports = app;
