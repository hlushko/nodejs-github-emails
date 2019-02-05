'use strict';

const Sentry = require(`@sentry/node`)
    , Koa = require(`koa`)
    , bodyParser = require(`koa-bodyparser`)
    , routes = require(`./routes`)
;
const app = new Koa()
    , PORT = process.env.PORT || 1337
;

if (process.env.SENTRY_DSN && process.env.NODE_ENV !== `test`) {
    // error tracking tool
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

app.use(bodyParser());
app.use(routes.routes());

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
