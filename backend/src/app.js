const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const v1Routes = require('./routes/v1');

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'Pokemon Battle Hub backend is running',
    docs: '/api/v1/health'
  });
});

app.use('/api/v1', v1Routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal Server Error'
  });
});

module.exports = app;
