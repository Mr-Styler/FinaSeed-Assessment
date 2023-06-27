const dotenv = require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const server = require('./app');

// Establishes Database connection
mongoose.connect(process.env.DB_URI).then(() => console.log('DB connection was successful.')).catch(err => console.log(`Error, Couldn't connect to the database`));

// Starts the web server
server.listen(1500, () => console.log(`Server is live and running`));