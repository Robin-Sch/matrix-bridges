const { Client, Intents, MessageAttachment, Message } = require('discord.js');
const { Client: RPCClient } = require('discord-rpc');

const {
    DISCORD_BOT_ID,
    DISCORD_BOT_SECRET,
    DISCORD_BOT_TOKEN,
    DISCORD_BOT_ENABLE_RPC,

    PORT,
} = process.env;

const redirectUri = `http://localhost:${PORT}`;
const scopes = ['rpc', 'rpc.notifications.read'];

const DiscordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
DiscordClient.login(DISCORD_BOT_TOKEN);

let DiscordRPCClient = null;
if (DISCORD_BOT_ENABLE_RPC === 'true') {
    DiscordRPCClient = new RPCClient({ transport: 'ipc' });

    DiscordRPCClient.on('ready', () => {
        DiscordRPCClient.subscribe('NOTIFICATION_CREATE');
    });

    DiscordRPCClient.login({ clientId: DISCORD_BOT_ID, clientSecret: DISCORD_BOT_SECRET, scopes, redirectUri, prompt: 'none' });
}

const replyDiscord = async (channel, message, images = []) => {
    if (typeof channel === 'string') channel = await DiscordClient.channels.fetch(channel);

    const attachments = images.map(i => new MessageAttachment(i))

    const json = {};
    if (message) json.content = message;
    if (attachments) json.files = attachments;

    return channel.send(json);
};

module.exports = { DiscordClient, DiscordRPCClient, replyDiscord };