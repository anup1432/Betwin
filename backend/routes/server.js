const userRoutes = require('./routes/user');
app.use('/api/auth', userRoutes);

const betRoutes = require('./routes/bet');
app.use('/api/bet', betRoutes);

const walletRoutes = require('./routes/wallet');
app.use('/api/wallet', walletRoutes);
