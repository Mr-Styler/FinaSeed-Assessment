const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, `user must have a name`]
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, `user must provide an email address`],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        select: false,
        required: [true, `user must have a password`]
    },
    // passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
});

// Check if inputed password is correct or not
userSchema.methods.correctPwd = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// // checks if password was changed while being logged in
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//     if (this.passwordChangedAt) {
//         const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

//         return JWTTimestamp < changedTimestamp;
//     }
    
//     return false;
// }

// creates a reset token for forgotten password
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema)