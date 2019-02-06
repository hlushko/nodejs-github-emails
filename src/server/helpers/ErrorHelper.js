'use strict';

class ErrorHelper {

    /**
     * Write error in console
     * @param {*} err
     * @param {Object} ctx
     */
    static consoleError(err, ctx) {
        console.error(
            `\n\n` + (new Date()).toUTCString()
            + `: Error appeared during request:\n`
        );
        console.error(ctx.request);
        console.error(``);
        console.error(err);
        console.error(`\n`);
    }

}

module.exports = ErrorHelper;
