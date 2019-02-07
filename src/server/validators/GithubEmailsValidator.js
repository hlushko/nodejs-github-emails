'use strict';

const Validator = require(`better-validator`)
    , ValidationHelper = require(`../helpers/ValidationHelper`)
;

class GithubEmailsValidator {

    /**
     * Validates input params in GithubEmails request
     * @param {Object} request
     *
     * @return {Object|null} List of errors. null - without errors
     */
    static run(request) {
        const validator = new Validator();

        validator(request.body).required().isObject(obj => {
            obj(`username`).required().isString().notEmpty();
            obj(`message`).required().isString().notEmpty();
        });

        return ValidationHelper.formatErrors(validator.run());
    }
}

module.exports = GithubEmailsValidator;
