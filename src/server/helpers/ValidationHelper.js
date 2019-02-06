'use strict';

class ValidationHelper {

    /**
     * Changes validation errors format from Array to Object style
     * @param {Array} errorList
     *
     * @return {Object|null}
     */
    static formatErrors(errorList) {
        if (errorList.length === 0) {
            return null;
        }
        const resultErrors = {};
        errorList.forEach(errorItem => {
            resultErrors[errorItem.path[0]] = {
                failed: errorItem.failed
                , value: errorItem.value
            };
        });

        return resultErrors;
    }
}

module.exports = ValidationHelper;
