const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
        data: {
            user
        }
    })
}

exports.register = async (req, res, next) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPwd(password, user.password))) {
        return res.status(404).json({
            status: 'failed',
            messege: 'Invalid credentials.'
        })
    }
}