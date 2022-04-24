const express = require('express');
const app = express();

const { replyDiscord } = require('./discord.js');
const { replyMatrix } = require('./matrix.js');

const {
    DISCORD_CHANNEL_ID,

    MATRIX_ROOM_ID,

    PORT,
    NOTIFICATION_KEY,
} = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/notification', async (req, res) => {
    const key = req.body.key;
    if (!key || key !== NOTIFICATION_KEY) return res.status(401).send('Invalid key');

    const notification = req.body.notification;
    if (!notification) return res.status(400).send('No notification given');
    if (notification.length > 1000) return res.status(400).send('The notification is too long (max is 1000 characters)');

    await replyDiscord(DISCORD_CHANNEL_ID, notification, []);
    await replyMatrix(MATRIX_ROOM_ID, notification, []);

    return res.status(200).send('Ok');
});
/** example for above
    fetch('http://localhost:3000/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'NOTIFICATION_KEY', notification: 'This is a notification' })
    });

    curl -X POST -H "Content-Type: application/json" -d '{"key": "NOTIFICATION_KEY", "notification": "This is a notification"}' http://localhost:3000/notification
*/

app.listen(PORT);

module.exports = { app };