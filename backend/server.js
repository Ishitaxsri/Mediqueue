// Experiments 5 + 6: Node.js / Express server with routing and middleware
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { ensureBeds } = require('./config/beds');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());          // Experiment 9: allow the React app to call this API
app.use(express.json());
app.use(logger);          // custom logger middleware

app.get('/', (req, res) => res.json({ message: 'MediQueue API is running' }));
app.use('/api/patients', require('./routes/patients'));
app.use('/api', require('./routes/hospital'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(ensureBeds)
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not start server:', err.message);
    process.exit(1);
  });
