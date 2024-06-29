const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

let donations = 1; // Initialize the counter with a default value of 1
const donationsFile = 'Donations.json';

// Load counter from file if it exists
if (fs.existsSync(donationsFile)) {
    const data = fs.readFileSync(donationsFile);
    donations = JSON.parse(data).donations;
}

// Function to save the counter to a file
const saveDonation = () => {
    fs.writeFileSync(donationsFile, JSON.stringify({ donations }));
};

app.get('/api/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const url = `https://www.roblox.com/users/inventory/list-json?assetTypeId=34&cursor=&itemsPerPage=300&pageNumber=1&userId=${userId}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.Data && response.data.Data.Items) {
            const gamepasses = response.data.Data.Items;
            res.json(gamepasses);
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

module.exports = app;
module.exports = (req, res) => app(req, res); 
