const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 *60 *60 *1000),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined; 

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

exports.passwordCheck = (req, res, next) => {
    const { password, confirmPassword} = req.body;
    if (password !== confirmPassword) {
        return next(new AppError(`password and confirmPassword do not match`, 400))
    }
    next()
}


// regster
exports.register = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id)

    createSendToken(newUser, 201, res)

})

// login
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!email || !password) {
        return next(new AppError(`Please provide an email and password`, 400))
    }

    if (!user || !(await user.correctPwd(password, user.password))) return res.status(400).json({
        status: 'failed',
        message: 'Wrong or invalid credentials'
    });

    createSendToken(user, 200, res)
})

// checks if user is authenticated
exports.isAuthenticated = catchAsync(async (req, res, next) => {
    // Get token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        // Gets token from cookie if there is a cookie
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new AppError(`You are not logged in! Please log in to get access.`, 401));
    }

    // Verifcation token
    const verified = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(verified.id);

    // Checks  if user still exists
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    // if (freshUser.changedPasswordAfter(verified.iat)) {
    //     return next(new AppError('User recently changed password! Please log in again', 401))
    // }

    req.user = freshUser;
    next();
})

// forgot password
exports.forgotPwd = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return next(new AppError('There is no user with that email address.', 400));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get('host')}/api/users/reset/${resetToken}`;

    const message = `Forgot your password?\n Go to the follwing link ${resetURL}.\n this will only be valid till ${user.passwordResetExpires.toDateString()}.\n if not please ignore this email.`

        res.status(200).json({
            status: 'success',
            message: `Token sent to email. ${resetURL}`
        })
});

// reset password
exports.resetPwd = catchAsync(async (req, res, next) => {
    console.log(req.params.token);

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() }});

    if (!user) {
        return next(new AppError(`Token is invalid or has expired.`, 400))
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined, user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res)
});


// logout