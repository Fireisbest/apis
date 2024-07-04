const { createCanvas, loadImage } = require('canvas');

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

    // Set background color
    context.fillStyle = '#000000';
    context.fillRect(0, 0, width, height);

    // Draw the circle for donator
    context.beginPath();
    context.arc(300, 200, 100, 0, Math.PI * 2, true);
    context.lineWidth = 10;
    context.strokeStyle = '#FF00FF';
    context.stroke();

    // Draw the circle for raiser
    context.beginPath();
    context.arc(900, 200, 100, 0, Math.PI * 2, true);
    context.lineWidth = 10;
    context.strokeStyle = '#FF00FF';
    context.stroke();

    // Draw the amount
    context.fillStyle = '#FF00FF';
    context.font = 'bold 72px Arial';
    context.fillText(amount, 480, 220);

    // Draw "donated to" text
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 48px Arial';
    context.fillText('donated to', 550, 300);

    // Draw the usernames
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 32px Arial';
    context.fillText(`@${donator}`, 200, 350);
    context.fillText(`@${raiser}`, 800, 350);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
};
