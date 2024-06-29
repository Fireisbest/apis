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

// Function to save the counter to a file
const saveDonation = () => {
    fs.writeFileSync(donationsFile, JSON.stringify({ donations }));
};
const saveGift = () => {
    fs.writeFileSync(giftsFile, JSON.stringify({ gifts }));
};

app.get('/api/gamepasses/:userId/', async (req, res) => {
    const userId = req.params.userId;
    const url = `https://www.roblox.com/users/inventory/list-json?assetTypeId=34&cursor=&itemsPerPage=100&pageNumber=1&userId=${userId}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.Data && response.data.Data.Items) {
            const gamepasses = response.data.Data;
            const gamesUrl = `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=2&limit=10&sortOrder=Asc`;

            const gamesResponse = await axios.get(gamesUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json'
                }
            });

            if (gamesResponse.data && gamesResponse.data.data) {
                const games = gamesResponse.data.data;

                for (const game of games) {
                    const gamePassesUrl = `https://games.roproxy.com/v1/games/${game.id}/game-passes?limit=10&sortOrder=Asc`;
                    const gamePassesResponse = await axios.get(gamePassesUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'application/json'
                        }
                    });

                    if (gamePassesResponse.data && gamePassesResponse.data.data) {
                        game.gamePasses = gamePassesResponse.data.data;
                    } else {
                        game.gamePasses = [];
                    }
                }

                gamepasses.Games = games;
                res.json(gamepasses);
            } else {
                res.status(404).json({ error: 'No games found for this user.' });
            }
        } else {
            res.status(404).json({ error: 'No game passes found for this user.' });
        }
    } catch (error) {
        console.error('Error fetching game passes:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
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
module.exports = (req, res) => app(req, res);
