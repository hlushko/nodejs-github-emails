'use strict';

const ResponseHelper = require(`./helpers/ResponseHelper`);

class ErrorHandler {

    /**
     * Handles errors appeared during request processing
     * @param {Object} ctx
     * @param {function} next
     *
     * @return {Promise<void>}
     */
    static async handle(ctx, next) {
        try {
            await next();

            // Handle 404 upstream.
            const status = ctx.status || ResponseHelper.STATUS_CODE_NOT_FOUND;
            if (status === ResponseHelper.STATUS_CODE_NOT_FOUND) {
                ctx.throw(status);
            }
        } catch (err) {
            // will only respond with JSON
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                status: ResponseHelper.STATUS_ERROR
                , message: err.message
            };

            ctx.app.emit(`error`, err, ctx);
        }
    }
}

module.exports = ErrorHandler;
