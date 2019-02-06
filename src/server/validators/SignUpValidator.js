'use strict';

const Validator = require(`better-validator`)
    , ValidationHelper = require(`../helpers/ValidationHelper`)
;

class SignUpValidator {

    /**
     * Validates input params in SignUp request
     * @param {Object} request
     *
     * @return {Object|null} List of errors. null - without errors
     */
    static run(request) {
        const validator = new Validator();

        validator(request.body).required().isObject(obj => {
            obj(`email`).required().isString().isEmail();
            obj(`password`).required().isString().lengthInRange(3, 64);
        });
        validator(request.files).display(`avatar`).required().isObject(obj => {
            obj(`avatar`).required().isObject(avatar => {
                avatar(`type`).display(`avatar`).required().isString()
                    .isIn([`image/jpeg`, `image/png`]);
            });
            // TODO: add image content validation for provided type, not only metadata
        });

        return ValidationHelper.formatErrors(validator.run());
    }
}

module.exports = SignUpValidator;
