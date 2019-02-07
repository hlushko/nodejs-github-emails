'use strict';

const { sprintf } = require(`sprintf-js`)
    , ResponseHelper = require(`./helpers/ResponseHelper`)
    , AuthHelper = require(`./helpers/AuthHelper`)
    , ErrorHelper = require(`./helpers/ErrorHelper`)
    , UserModel = require(`./models/UserModel`)
    , errorMessage = `You have no access rights to perform current action.` // TODO: store such messages in special place
;

class UserAuth {

    /**
     * Handles auth process using access token case
     * @param {Object} ctx
     * @param {function} next
     *
     * @return {Promise<void>}
     */
    static async handleToken(ctx, next) {
        const accessTokenHeader = `x-access-token`;
        if (false === (accessTokenHeader in ctx.request.headers)) {
            ctx.throw(
                ResponseHelper.STATUS_CODE_UNAUTHORIZED
                , errorMessage
            );
        }

        return AuthHelper.verifyToken(ctx.request.headers[accessTokenHeader])
            .catch(err => {
                ErrorHelper.consoleError(err, ctx);

                ctx.throw(
                    ResponseHelper.STATUS_CODE_UNAUTHORIZED
                    , errorMessage
                );
            })
            .then(decodedEmail => {
                return Promise.all([
                    decodedEmail
                    , UserModel.findOne({ email: decodedEmail })
                ]);
            })
            .then(results => {
                if (null === results[1]) {
                    ErrorHelper.consoleError(
                        sprintf(`Can't find user by email "%s".`, results[0])
                        , ctx
                    );
                    ctx.throw(
                        ResponseHelper.STATUS_CODE_UNAUTHORIZED
                        , errorMessage
                    );
                }

                ctx.user = results[1];

                return next();
            });
    }
}

module.exports = UserAuth;
