'use strict';

const Validator = require(`better-validator`)
    , ValidationHelper = require(`../helpers/ValidationHelper`)
;

class SignInValidator {

    /**
     * Validates input params in SignIn request
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

        return ValidationHelper.formatErrors(validator.run());
    }
}

module.exports = SignInValidator;
