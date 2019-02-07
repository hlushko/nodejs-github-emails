'use strict';

const { sprintf } = require(`sprintf-js`);

/**
 * @property {string} STATUS_SUCCESS
 * @property {string} STATUS_ERROR
 * @property {number} STATUS_CODE_BAD_REQUEST
 * @property {number} STATUS_CODE_UNAUTHORIZED
 * @property {number} STATUS_CODE_NOT_FOUND
 * @property {number} STATUS_CODE_METHOD_NOT_ALLOWED
 */
class ResponseHelper {

    /**
     * Builds response if validation errors appeared
     * @param {Object} ctx
     * @param {Object} errors
     */
    static buildValidationErrorResponse(ctx, errors) {
        ctx.status = this.STATUS_CODE_BAD_REQUEST;
        ctx.body = {
            status: this.STATUS_ERROR
            , message: sprintf(
                `Validation error(s) with parameters "%s" appeared.` // TODO: move message to separate space ?
                , Object.keys(errors).join(`, `)
            )
            , errors: errors
        };
    }
}

ResponseHelper.STATUS_SUCCESS = `success`;
ResponseHelper.STATUS_ERROR = `error`;
ResponseHelper.STATUS_CODE_OK = 200;
ResponseHelper.STATUS_CODE_BAD_REQUEST = 400;
ResponseHelper.STATUS_CODE_UNAUTHORIZED = 401;
ResponseHelper.STATUS_CODE_NOT_FOUND = 404;
ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED = 405;

module.exports = ResponseHelper;
