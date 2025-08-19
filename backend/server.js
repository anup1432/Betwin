// 1) In the imports at the top:
const express = require('express');
const cors = require('cors'); // <-- ADD THIS LINE

const app = express();

// 2) Just after you create 'app':
app.use(cors()); // <-- ADD THIS LINE
app.use(express.json()); // Already present
