require('dotenv').config();

const { join } = require('path');
const { DiscordClient, DiscordRPCClient, replyDiscord } = require(join(__dirname, './clients/discord.js'));
const { handleCommand } = require(join(__dirname, './clients/handleCommand.js'));
const { MatrixClient, IsMatrixClientPrepared, replyMatrix } = require(join(__dirname, './clients/matrix.js'));
const { getEmails } = require(join(__dirname, './clients/imap.js'));
const { app } = require(join(__dirname, './clients/web.js'));

const {
    MATRIX_ROOM_ID,

    DISCORD_CHANNEL_ID,
} = process.env;

if (DiscordClient) {
	DiscordClient.on('messageCreate', (message) => {
	    if (message.author.bot) return;
	
	    if (message.channel.id == DISCORD_CHANNEL_ID && message.content[0] === '!') {
	        const args = message.content.split(' ');
	
	        return handleCommand(args, message.channel, replyDiscord);
	    }
	});
}

if (DiscordRPCClient) {
    DiscordRPCClient.on("NOTIFICATION_CREATE", data => {
        // const channelName = data.title;
        const content = data.message.content;
        const author = `${data.message.author.username}#${data.message.author.discriminator}`;
    
        return replyMatrix(MATRIX_ROOM_ID, `${author}:\n${content}`, []);
    });
}

if (MatrixClient) {
	MatrixClient.on("Room.timeline", async (event, room, toStartOfTimeline) => {
	    if (!(await IsMatrixClientPrepared())) return;
	    if (event.getType() !== "m.room.message") return;
	
	    if (event.getRoomId() === MATRIX_ROOM_ID && event.getContent().body[0] === '!') {
	        const args = event.event.content.body.split(' ');
	        
	        return handleCommand(args, MATRIX_ROOM_ID, replyMatrix);
	    }
	});
} 

setInterval(async () => {
	const emails = await getEmails();
	
	for(let i = 0; i < emails.length; i++) {
		const { from, to, subject, text } = emails[i];
		const msg = `from: ${from}\nto: ${to}\nsubject: ${subject}\n\n${text}`;
		
		replyDiscord(DISCORD_CHANNEL_ID, msg, []);
		replyMatrix(MATRIX_ROOM_ID, msg, [])
	}
}, 60 * 60 * 1000);