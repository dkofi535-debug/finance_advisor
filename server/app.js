const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Finance Advisor API is running' });
});

app.use('/api/health', healthRoutes);

app.use(errorHandler);

module.exports = app;
