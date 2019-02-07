'use strict';

const Router = require(`koa-router`)
    , koaBody = require(`koa-body`)
    , UserAuth = require(`./UserAuth`)
    , UserController = require(`./controllers/UserController`)
    , GithubEmailsController = require(`./controllers/GithubEmailsController`)
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

router.post(`/github-emails`, UserAuth.handleToken);
router.post(`/github-emails`, koaBody(), GithubEmailsController.process);

module.exports = router;
