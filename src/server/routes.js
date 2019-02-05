'use strict';

const Router = require(`koa-router`)
    , UserController = require(`./controllers/UserController`)
    , router = new Router()
;

router.get(`/`, async (ctx) => {
    ctx.body = {
        status: 'success',
        message: 'hello, world!'
    };
});

router.post(`/sign-up`, UserController.signUp);
router.post(`/sign-in`, UserController.signIn);

module.exports = router;
