import express from 'express';
import cors from 'cors';
import { cfg } from './config.js';
import { connectDB } from './db.js';
import { auth } from './routes/auth.js';
import { battles } from './routes/battles.js';
import { admin } from './routes/admin.js';
import { wallet } from './routes/wallet.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: cfg.CORS_ORIGIN }));

app.get('/api/health', (req,res)=>res.json({ ok:true, telegram: cfg.TELEGRAM_LINK }));

app.use('/api/auth', auth);
app.use('/api/battles', battles);
app.use('/api/admin', admin);
app.use('/api/wallet', wallet);

const start = async ()=>{
  await connectDB();
  app.listen(cfg.PORT, ()=>console.log('API on :' + cfg.PORT));
};
start();
