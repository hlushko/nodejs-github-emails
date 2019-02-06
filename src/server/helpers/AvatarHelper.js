'use strict';

const cloudinary = require(`cloudinary`)
    , config = require(`../../../config`)
;

// private methods
const _uploadOrigin = Symbol(`uploadOrigin`)
    , _uploadThumb = Symbol(`uploadThumb`)
;

class AvatarHelper {

    /**
     * Uploads avatar file and returns URL of it and it's thumbnail
     * @param {string} path
     *
     * @return {Promise<{origin: string, thumb: string}>}
     */
    static async upload(path) {
        return Promise.all([
            this[_uploadOrigin](path)
            , this[_uploadThumb](path)
        ]).then(results => {
            return {
                origin: results[0].secure_url
                , thumb: results[1].secure_url
            }
        });
    }

    // private

    /**
     * Uploads file by path without changes
     * @param {string} path
     *
     * @return {Promise<Object>} Detail information about file
     */
    static async [_uploadOrigin](path) {
        return new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(
                path
                , (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    /**
     * Creates thumbnail and upload it by path
     * @param {string} path
     *
     * @return {Promise<Object>} Detail information about file
     */
    static async [_uploadThumb](path) {
        return new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(
                path
                , {
                    width: config.userAvatarThumbWidth
                    , height: config.userAvatarThumbHeight
                    , crop: `thumb`
                    , gravity: `face`
                }
                , (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }
}

module.exports = AvatarHelper;
