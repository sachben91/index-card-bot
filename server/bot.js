import { Client, GatewayIntentBits } from 'discord.js';
import { scoreMessage } from './scorer.js';
import { insertCard } from './db.js';

const SCORE_THRESHOLD = parseInt(process.env.SCORE_THRESHOLD || '70', 10);
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

export function startBot(token) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once('ready', () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (CHANNEL_ID && message.channelId !== CHANNEL_ID) return;

    const text = message.content.trim();
    if (!text || text.length > 500) return;

    const { score, reason } = await scoreMessage(text);
    console.log(`[bot] score=${score} reason="${reason}" text="${text.slice(0, 60)}"`);

    if (score >= SCORE_THRESHOLD) {
      insertCard(text, 'discord');
      await message.react('🃏').catch(() => {});
    }
  });

  client.login(token).catch((err) => {
    console.error('Discord login failed:', err.message);
  });
}
