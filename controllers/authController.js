const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// creates a Json Web Token
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// sends the created Token to the user or browser
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *30 *24 *60 *60 *1000), //Expires in 30 days
        secure: false,
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: "success",
        token,
        payload: {
            user
        }
    })
}

exports.register = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new AppError('Please provide an email and password!', 400))
    }

    const user = await User.findOne({email}).select('+password');
    console.log(user);

    if(!user || !(await user.correctPwd(password, user.password))) {
        return next(new AppError(`Wrong or Invalid Credentials.`, 404));
    }

    createSendToken(user, 200, res)
});

exports.isAuthenticated = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError("You're  not logged in. Please log in to get access.", 401));
    };

    const verified = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(verified.id);

    if (!freshUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    req.user = freshUser;
    next();
});

exports.forgotPasword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return next(new AppError('There is no user with that email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;

    const message = `Forgot your password?\n Go to the follwing link ${resetURL}.\n this will only be valid till ${user.passwordResetExpires.toDateString()}.\n if not please ignore this email.`

    res.status(200).json({
        status: 'success',
        message
    })
});
    

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() }});

    if (!user) {
        return next(new AppError(`Token is invalid or has expired.`, 400))
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined, user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});
