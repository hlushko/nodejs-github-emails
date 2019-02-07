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
        status: `success`,
        message: `Use "/sign-up" and/or "/sign-in" routes for authenticate. After auth, use "/github-emails" route for email sending.`
    };
});

router.post(`/sign-up`, koaBody({ multipart: true }), UserController.signUp);
router.post(`/sign-in`, koaBody({ multipart: true }), UserController.signIn);

router.post(`/github-emails`, UserAuth.handleToken);
router.post(`/github-emails`, koaBody(), GithubEmailsController.process);

module.exports = router;
