const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const path = require('path');

module.exports = async (req, res) => {
    const { donator, raiser, amount } = req.query;

    if (!donator || !raiser || !amount) {
        res.status(400).send('Missing parameters');
        return;
    }

    const width = 1200;
    const height = 400;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Load the base image
    const baseImagePath = path.join(__dirname, 'base_image.png');
    const baseImage = await loadImage(baseImagePath);
    context.drawImage(baseImage, 0, 0, width, height);

    // Set up fonts and colors
    context.font = '48px Arial';
    context.fillStyle = '#FFFFFF';

    // Draw the amount
    context.fillStyle = '#FF00FF';
    context.fillText(amount, 500, 200);

    // Draw the usernames
    context.fillStyle = '#FFFFFF';
    context.fillText(`@${donator}`, 50, 350);
    context.fillText(`@${raiser}`, 950, 350);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Use sharp to handle image resizing if needed
    const image = await sharp(buffer).toFormat('png').toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(image);
};
