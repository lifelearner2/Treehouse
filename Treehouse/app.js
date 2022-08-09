'use strict';

const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const { sequelize } = require('./models');

// Create the Express app.
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// Setup morgan which gives us HTTP request logging.
app.use(morgan('dev'));

// Setup a friendly greeting for the root route.
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API & Sequelize model validation project!',
  });
});

// Add routes.
app.use('/api', routes);

// Send 404 if no other route matched.
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// Setup a global error handler.
app.use((err, req, res, next) => {
  console.error(`Global error handler: ${JSON.stringify(err.stack)}`);

  res.status(500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Set our port.
app.set('port', process.env.PORT || 5000);

// Test the database connection.
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Sequelize model synchronization, then start listening on our port.
sequelize.sync()
  .then( () => {
    const server = app.listen(app.get('port'), () => {
      console.log(`Express server is listening on port ${server.address().port}`);
    });
  });