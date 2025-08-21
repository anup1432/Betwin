import dotenv from 'dotenv';
dotenv.config();
export const cfg = {
  PORT: process.env.PORT || 10000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_USER: process.env.ADMIN_USER,
  ADMIN_PASS: process.env.ADMIN_PASS,
  DEFAULT_DURATION: Number(process.env.BATTLE_DEFAULT_DURATION || 60),
  SYMBOLS: (process.env.SYMBOLS || 'BTCUSDT').split(','),
  TELEGRAM_LINK: process.env.TELEGRAM_LINK || ''
};
