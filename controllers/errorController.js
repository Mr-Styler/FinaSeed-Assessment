const AppError = require('./../utils/appError')


const handleCastErrorDB = err => {
    console.log('ERROR!!!!!!!!!!!!!!!')
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicateErrorDB = err => {
    console.log('ERROR!!!!!!!!!!!!!!!')
    const value = err.keyValue.name
    const message = `Duplicate field value: ${value}, please use another value!`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    console.log('ERROR!!!!!!!!!!!!!!!')
    console.log('validation error')

    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const handleJWTErrorDB = err => {
    return new AppError('Invalid token. Please log in again!', 401)
}

const handleJWTexpiredErrorDB = err => {
    return new AppError('Your token has expired! Please log in again.', 401);
}

const SendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status;

    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateErrorDB(error)
    if (error._message.split(' ')[1] === 'validation') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTErrorDB(error)
    if (error.name === 'TokenExpiredError') error = handleJWTexpiredErrorDB(error)
    SendErrorDev(err, res)

}