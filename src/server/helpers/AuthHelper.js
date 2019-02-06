'use strict';

const bcrypt = require(`bcrypt`)
    , jwt = require(`jsonwebtoken`)
    , config = require(`../../../config`)
;

class AuthHelper {

    /**
     * Builds hash for provided user password
     * @param {string} password
     *
     * @return {Promise<string>}
     */
    static async hash(password) {
        return bcrypt.hash(password, config.userPasswordSaltRounds);
    }

    /**
     * Compares provided user password and previously generated hash
     * @param {string} password
     * @param {string} hash
     *
     * @return {Promise<boolean>}
     */
    static async compare(password, hash) {
        return bcrypt.compare(password, hash);
    }

    /**
     * Builds access token by user email address
     * @param {string} email
     *
     * @return {Promise<string>}
     */
    static async buildToken(email) {
        return new Promise((resolve, reject) => {
            jwt.sign(
                { email: email }
                , config.userTokenSecret
                , { expiresIn: config.userTokenExpiresIn }
                , (err, token) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(token);
                    }
                }
            );
        });
    }

    /**
     * Verify access token provided by user and returns email on success
     * @param {string} token
     *
     * @return {Promise<string>}
     */
    static async verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token
                , config.userTokenSecret
                , (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.email);
                    }
                }
            );
        });
    }
}

module.exports = AuthHelper;
