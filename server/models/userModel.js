const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const util = require('util');
const bcrypt = require('bcrypt');

const secret = require('../secret');
const userCourseSchema = require('./userCourseModel').schema;

const verify = util.promisify(jwt.verify);

/* Resource: https://mongoosejs.com/docs/ */

/* Create a user schema */
const userSchema = new mongoose.Schema({
    name: String,                       // name of user
    email: String,                      // email address of user
    password: String,                   // hashed password
    verified: Boolean,                  // whether the user has verified their email address
    verificationToken: String,          // token used to verify the user's email address
    tokenBlacklist: [String],
    completedCourses: [userCourseSchema], // courses that the user has completed
});

/* modify secret key by xor-ing it with hash of user's password
*  password changes will then invalidate the secret key */
userSchema.methods.permuteKey = function(secretKey) {
    // compute sha256 hash of password
    const hash = crypto.createHash('sha256')
        .update(this.password).digest();

    return Buffer.alloc(Math.max(hash.length, secretKey.length)) // create buffer of whatever is the max length
        .map((_, i) => secretKey[i % secretKey.length] ^ hash[i % hash.length]); // xor the secret key with password hash
}

/* remove expired tokens from blacklist */
userSchema.methods.filterBlacklist = async function() {
    if (!this.tokenBlacklist) return;

    const userSecret = this.permuteKey(secret);

    // try to verify each token
    const potentiallyValidTokens = await Promise.all(
        this.tokenBlacklist.map(token => verify(token, userSecret)
            .then(() => token).catch(() => false)));

    // remove already expired tokens
    this.tokenBlacklist = potentiallyValidTokens.filter(x => x);
    await this.save();
}

userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.verificationToken;
    delete obj.__v;
    delete obj.tokenBlacklist;
    return obj;
};

// https://stackoverflow.com/questions/14588032/mongoose-password-hashing
userSchema.pre('save', async function (next) {
    // don't need to re-hash password if password not modified
    if (!this.isModified('password')) return next();


});

userSchema.methods.validatePassword = async function (password) {
    // source: https://www.makeuseof.com/nodejs-bcrypt-hash-verify-salt-password/ 
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', userSchema);