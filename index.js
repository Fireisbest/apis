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

// Function to get all pages of data from a paginated API
const getAllPages = async (baseUrl) => {
    let allData = [];
    let cursor = '';

    do {
        const url = cursor ? `${baseUrl}&cursor=${cursor}` : baseUrl;
        const response = await axios.get(url);
        const pageData = response.data;

        if (pageData && pageData.data) {
            allData = allData.concat(pageData.data);
            cursor = pageData.nextPageCursor || '';
        } else {
            cursor = '';
        }
    } while (cursor);

    return allData;
};

// Function to get product info (game pass, clothing, asset) from Roblox API
const getProductInfo = async (assetId, assetType) => {
    const url = `https://api.roblox.com/marketplace/productinfo?assetId=${assetId}`;
    try {
        const response = await axios.get(url);
        const productInfo = response.data;
        return {
            id: assetId,
            type: assetType,
            name: productInfo.Name,
            price: productInfo.PriceInRobux || 0,
            icon: `rbxassetid://${productInfo.IconImageAssetId}`
        };
    } catch (error) {
        console.warn(`Failed to get product info for ${assetType}: ${assetId}`);
        return null;
    }
};

app.get('/api/gamepasses/:userId', async (req, res) => {
    const userId = req.params.userId;
    const clothingTypes = ['Shirt', 'Pants', 'TShirt'];
    const assets = [];

    try {
        // Get clothing items created by the user
        for (const type of clothingTypes) {
            const clothingUrl = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?assetType=${type}&limit=100&sortOrder=Asc`;
            const clothingItems = await getAllPages(clothingUrl);

            for (const item of clothingItems) {
                if (item.creatorTargetId == userId) {
                    const productInfo = await getProductInfo(item.assetId, type);
                    if (productInfo) {
                        assets.push(productInfo);
                    }
                }
            }
        }

        // Get game passes created by the user
        const gamesUrl = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`;
        const games = await getAllPages(gamesUrl);

        for (const game of games) {
            const gamePassesUrl = `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100&sortOrder=Asc`;
            const gamePasses = await getAllPages(gamePassesUrl);

            for (const gamePass of gamePasses) {
                if (gamePass.creatorTargetId == userId) {
                    const productInfo = await getProductInfo(gamePass.id, 'GamePass');
                    if (productInfo) {
                        assets.push(productInfo);
                    }
                }
            }
        }

        res.json({ assets });
    } catch (error) {
        console.error('Error fetching assets:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the assets' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
