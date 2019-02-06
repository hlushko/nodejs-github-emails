'use strict';

const mongoose = require(`mongoose`);

// Declare Schema
const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String
            , required: true
            , unique: true
            , trim: true
            , lowercase: true
            , maxlength: 255
            , match: /.+@.+\..+/ // TODO: need to verify email by sending confirm email message
        }
        , passwordHash: { type: String, required: true }
        , avatarOriginUrl: { type: String }
        , avatarThumbUrl: { type: String }
    }
    , { timestamps: true }
);

// Declare Model to mongoose with Schema
const UserModel = mongoose.model(`User`, UserSchema);

module.exports = UserModel;
