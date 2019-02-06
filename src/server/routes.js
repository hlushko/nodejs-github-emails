'use strict';

const Router = require(`koa-router`)
    , koaBody = require(`koa-body`)
    , UserController = require(`./controllers/UserController`)
    , router = new Router()
;

router.get(`/`, async (ctx) => {
    ctx.body = {
        status: 'success',
        message: 'hello, world!'
    };
});

router.post(`/sign-up`, koaBody({ multipart: true }), UserController.signUp);
router.post(`/sign-in`, koaBody(), UserController.signIn);

module.exports = router;
