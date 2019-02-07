'use strict';

const Sentry = require(`@sentry/node`)
    , Koa = require(`koa`)
    , mongoose = require(`mongoose`)
    , ErrorHelper = require(`./helpers/ErrorHelper`)
    , ErrorHandler = require(`./ErrorHandler`)
    , routes = require(`./routes`)
;
const app = new Koa()
    , PORT = process.env.PORT || 1337
;

// TODO: add check for all required env variables for project

if (process.env.SENTRY_DSN && process.env.NODE_ENV !== `test`) {
    // error tracking tool
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

app.use(ErrorHandler.handle);
app.use(routes.routes());
app.use(routes.allowedMethods({ throw: true }));

app.on(`error`, (err, ctx) => {
    // TODO: filter MethodNotAllowedError
    ErrorHelper.consoleError(err, ctx);
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

mongoose.connect(
    process.env.MONGODB_URI
    , { useNewUrlParser: true, useCreateIndex: true }
);

module.exports = server;
