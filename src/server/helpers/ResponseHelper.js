'use strict';

/**
 * @property {string} STATUS_SUCCESS
 * @property {string} STATUS_ERROR
 * @property {number} STATUS_CODE_BAD_REQUEST
 * @property {number} STATUS_CODE_NOT_FOUND
 * @property {number} STATUS_CODE_METHOD_NOT_ALLOWED
 */
class ResponseHelper {
}

ResponseHelper.STATUS_SUCCESS = `success`;
ResponseHelper.STATUS_ERROR = `error`;
ResponseHelper.STATUS_CODE_OK = 200;
ResponseHelper.STATUS_CODE_BAD_REQUEST = 400;
ResponseHelper.STATUS_CODE_NOT_FOUND = 404;
ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED = 405;

module.exports = ResponseHelper;
