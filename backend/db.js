import mongoose from 'mongoose';
import { cfg } from './config.js';
export async function connectDB() {
  if (!cfg.MONGO_URI) throw new Error('MONGO_URI missing');
  await mongoose.connect(cfg.MONGO_URI, { dbName: 'market_battle' });
  console.log('MongoDB connected');
}
