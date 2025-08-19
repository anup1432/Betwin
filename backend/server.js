const express = require('express');
const cors = require('cors');       // ------ Yeh line add karo
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors());                    // ------ Yeh line add karo
app.use(express.json());

// MongoDB Connection (use your MONGODB_URI env variable)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Example route (remove if you already have your API)
app.get('/', (req, res) => res.send('API Running!'));

// Baaki aapke auth, bet, wallet routes yahan hi rakho
// Example: app.post('/api/auth/register', ...)

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
