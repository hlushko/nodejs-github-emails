'use strict';

const SignUpValidator = require(`../validators/SignUpValidator`)
    , SignInValidator = require(`../validators/SignInValidator`)
    , ResponseHelper = require(`../helpers/ResponseHelper`)
    , AuthHelper = require(`../helpers/AuthHelper`)
    , AvatarHelper = require(`../helpers/AvatarHelper`)
    , UserModel = require(`../models/UserModel`)
    , validationErrorName = `ValidationError`
    , signInWrongCredentialsErrorMessage = `Provided "email" and "password" combination was not found.`// TODO: store message in other place
;

class UserController {

    /**
     * @api {post} /sign-up Register new user of a system
     * @apiName SignUp
     * @apiGroup User
     * @apiPermission none
     *
     * @apiParam {String} email Email address of new user
     * @apiParam {String} password Desired password for new user
     * @apiParam {File} avatar Image which will be used as avatar of user
     *
     * @apiSuccess {String} status Result of performing request
     * @apiSuccess {String} token Access token for next requests
     * @apiSuccess {String} avatarUrl An URL address of stored avatar
     *
     * @apiError BadRequest If some data was not provided, has wrong value or user was registered previously
     *
     * @apiErrorExample Response (example):
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "status": "error",
     *       "message": "Validation error(s) with parameters \"email\" appeared.",
     *       "errors": { "email": "User with provided "email" already exists." }
     *     }
     *
     * @param {Object} ctx Context of current request
     *
     * @return {Promise<void>}
     */
    static async signUp(ctx) {
        const validationErrors = SignUpValidator.run(ctx.request);
        if (validationErrors) {
            return ResponseHelper.buildValidationErrorResponse(
                ctx
                , validationErrors
            );
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
                    ResponseHelper.buildValidationErrorResponse(
                        ctx
                        , err.errors
                    );
                } else {
                    // TODO: handle hash generation error ?
                    // TODO: handle upload avatar error ?
                    // TODO: handle build access token error ?
                    // TODO: handle save Mongo model error ?

                    throw err;
                }
            });
    }

    /**
     * @api {post} /sign-in Login existing user by email and password
     * @apiName SignIn
     * @apiGroup User
     * @apiPermission none
     *
     * @apiParam {String} email Email address which was used at SignUp
     * @apiParam {String} password Password which associated with email
     *
     * @apiSuccess {String} status Result of performing request
     * @apiSuccess {String} token Access token for next requests
     * @apiSuccess {String} email An Email address of user
     * @apiSuccess {String} avatarUrl An URL address of stored avatar
     * @apiSuccess {String} originAvatarUrl An URL address of original avatar
     *
     * @apiError BadRequest If provided "email" and "password" pair was not found in system
     *
     * @apiErrorExample Response (example):
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "status": "error",
     *       "message": "Provided \"email\" and \"password\" combination was not found."
     *     }
     *
     *
     * @param {Object} ctx Context of current request
     *
     * @return {Promise<void>}
     */
    static async signIn(ctx) {
        const validationErrors = SignInValidator.run(ctx.request);
        if (validationErrors) {
            return ResponseHelper.buildValidationErrorResponse(
                ctx
                , validationErrors
            );
        }

        return UserModel.findOne({ email: ctx.request.body.email })
            .then(userModelData => {
                if (null === userModelData) {
                    ctx.throw(
                        ResponseHelper.STATUS_CODE_BAD_REQUEST
                        , signInWrongCredentialsErrorMessage
                    );
                }

                return Promise.all([
                    userModelData
                    , AuthHelper.compare(
                        ctx.request.body.password
                        , userModelData.passwordHash
                    )
                ]);
            })
            .then(results => {
                if (false === results[1]) {
                    ctx.throw(
                        ResponseHelper.STATUS_CODE_BAD_REQUEST
                        , signInWrongCredentialsErrorMessage
                    );
                }

                return Promise.all([
                    results[0]
                    , AuthHelper.buildToken(ctx.request.body.email)
                ]);
            })
            .then(results => {
                ctx.body = {
                    status: ResponseHelper.STATUS_SUCCESS
                    , token: results[1]
                    , email: results[0].email
                    , avatarUrl: results[0].avatarThumbUrl
                    , originAvatarUrl: results[0].avatarOriginUrl
                };
            })
            .catch(err => {
                // TODO: handle hash compare error ?
                // TODO: handle build access token error ?

                throw err;
            });
    }
}

module.exports = UserController;
