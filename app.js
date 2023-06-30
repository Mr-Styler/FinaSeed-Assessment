const express = require('express');
const app = express();

const userRoute = require('./routes/userRoute');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser')

// Allows data transfer in json format
app.use(express.json());
app.use(cookieParser());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    console.log('new request received!!!!');
    next()
})

app.use('/api/users', userRoute);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(errorController)

module.exports = app;