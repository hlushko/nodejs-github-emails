'use strict';

class UserController {

    static async signUp(ctx) {
        ctx.status = 400;
        ctx.body = { status: `error`, message: `Some error` };
    }

    static async signIn(ctx) {

    }
}

module.exports = UserController;
