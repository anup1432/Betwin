const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  wallet: { type: Number, default: 0 }
});
module.exports = mongoose.model('User', UserSchema);
