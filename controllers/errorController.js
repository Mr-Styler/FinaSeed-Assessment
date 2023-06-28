const AppError = require('./../utils/appError')


const handleCastErrorDB = err => {
    console.log('ERROR!!!!!!!!!!!!!!!')
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicateErrorDB = err => {
    console.log('ERROR!!!!!!!!!!!!!!!')
    console.log(err)
    const value = Object.values(err.keyValue)
    const message = `Duplicate field value: ${value.join('. ')}, please use another value!`;

    console.log(message)
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    console.log('ERROR!!!!!!!!!!!!!!!')

    const errors = Object.values(err.errors).map(el => el.properties.message)
// .map(el => el.properties.message)

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)

}

const handleJWTErrorDB = err => {
    return new AppError('Invalid token. Please log in again!', 401)
}

const handleJWTexpiredErrorDB = err => {
    return new AppError('Your token has expired! Please log in again.', 401);
}

const SendError = (err, res) => {
    console.log(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
}

module.exports = (err, req, res, next) => {
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = {...err};
    console.log(error);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error._message) {
        if (error._message.split(' ')[1] === 'validation') error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTErrorDB(error);
    if (error.name === 'TokenExpiredError') error = handleJWTexpiredErrorDB(error);
    SendError(error, res)

}