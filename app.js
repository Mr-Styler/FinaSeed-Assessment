const express = require('express');
const app = express();

const errorController = require('./controllers/errorController');

// Allows data transfer in json format
app.use(express.json);

const userRoute = require('./routes/userRoute');

app.use('/api/users', userRoute);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(errorController)

module.exports = app;