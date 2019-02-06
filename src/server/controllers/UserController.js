'use strict';

const { sprintf } = require(`sprintf-js`)
    , SignUpValidator = require(`../validators/SignUpValidator`)
    , ResponseHelper = require(`../helpers/ResponseHelper`)
    , AuthHelper = require(`../helpers/AuthHelper`)
    , AvatarHelper = require(`../helpers/AvatarHelper`)
    , UserModel = require(`../models/UserModel`)
    , validationErrorName = `ValidationError`
;

class UserController {

    /**
     * Handles user SignUp process
     * @param {Object} ctx Context of current request
     *
     * @return {Promise<void>}
     */
    static async signUp(ctx) {
        const validationErrors = SignUpValidator.run(ctx.request);
        if (validationErrors) {
            ctx.status = ResponseHelper.STATUS_CODE_BAD_REQUEST;
            ctx.body = {
                status: ResponseHelper.STATUS_ERROR
                , message: sprintf(
                    // TODO: move message to separate space
                    `Validation error(s) with parameters "%s" appeared during SignUp process.`
                    , Object.keys(validationErrors).join(`, `)
                )
                , errors: validationErrors
            };

            return;
        }

        return UserModel.findOne({ email: ctx.request.body.email })
            .then(userModelData => {
                if (userModelData) {
                    const err = new Error();
                    err.name = validationErrorName;
                    err.errors = {
                        // TODO: move message to separate space
                        email: `User with provided "email" already exists.`
                            + ` Use "/sign-in" with your password.`
                    };

                    throw err;
                }

                return Promise.all([
                    AuthHelper.hash(ctx.request.body.password)
                    , AvatarHelper.upload(ctx.request.files.avatar.path)
                ]);
            })
            .then(results => {
                const newUser = new UserModel({
                    email: ctx.request.body.email
                    , passwordHash: results[0]
                    , avatarOriginUrl: results[1].origin
                    , avatarThumbUrl: results[1].thumb
                });

                return Promise.all([
                    newUser.save()
                    , AuthHelper.buildToken(ctx.request.body.email)
                ]);
            })
            .then(results => {
                ctx.body = {
                    status: ResponseHelper.STATUS_SUCCESS
                    , token: results[1]
                    , avatarUrl: results[0].avatarThumbUrl
                };
            })
            .catch(err => {
                if (err.name === validationErrorName) {
                    ctx.status = ResponseHelper.STATUS_CODE_BAD_REQUEST;
                    ctx.body = {
                        status: ResponseHelper.STATUS_ERROR
                        , message: sprintf(
                            // TODO: move message to separate space
                            `Validation error(s) with parameters "%s" appeared during SignUp process.`
                            , Object.keys(err.errors).join(`, `)
                        )
                        , errors: err.errors
                    };
                } else {
                    // TODO: handle hash generation error ?
                    // TODO: handle upload avatar error ?
                    // TODO: handle build access token error ?
                    // TODO: handle save Mongo model error ?

                    throw err;
                }
            });
    }

    static async signIn(ctx) {

    }
}

module.exports = UserController;
