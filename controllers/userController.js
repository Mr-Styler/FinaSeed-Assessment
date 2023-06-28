const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        payload: {
            users
        }
    })
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('No user found with this Id.'))
    }

    res.status(200).json({
        status: 'success',
        payload: {
            user
        }
    })
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: false
    });

    if (!user) {
        return next(new AppError('No user found with this Id.'))
    }

    res.status(200).json({
        status: 'success',
        payload: {
            updatedUser
        }
    })
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError('No user found with this Id.'))
    }

    res.status(200).json({
        status: 'success',
        message: 'successfully deleted user'
    })
});