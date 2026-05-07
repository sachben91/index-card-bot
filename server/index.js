import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import api from './api.js';
import { getAdminCount, insertAdmin } from './db.js';
import { startBot } from './bot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', api);

const distDir = join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (req, res) => {
  res.sendFile(join(distDir, 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  if (getAdminCount() === 0) {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 10);
    insertAdmin('admin', hash);
    console.log(`Default admin created — username: admin, password: ${password}`);
  }

  if (process.env.DISCORD_BOT_TOKEN) {
    startBot(process.env.DISCORD_BOT_TOKEN);
  } else {
    console.log('No DISCORD_BOT_TOKEN set — bot not started');
  }
});
