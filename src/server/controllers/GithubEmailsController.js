'use strict';

const GithubEmailsValidator = require(`../validators/GithubEmailsValidator`)
    , ResponseHelper = require(`../helpers/ResponseHelper`)
    , GitHubHelper = require(`../helpers/GitHubHelper`)
    , WeatherHelper = require(`../helpers/WeatherHelper`)
    , MailHelper = require(`../helpers/MailHelper`)
    , config = require(`../../../config`)
;

class GithubEmailsController {

    /**
     * @api {post} /github-emails Sends email message to specified GitHub users
     * @apiName GitHubEmails
     * @apiGroup GitHub
     * @apiPermission user
     *
     * @apiHeader {String} x-access-token Token to authenticate user
     *
     * @apiParam {String[]} username List of GitHub username
     * @apiParam {String} message Message to send
     *
     * @apiSuccess {String} status Result of performing request
     * @apiSuccess {Number} number Number of sent emails
     *
     * @apiError BadRequest If some data was not provided or has wrong value
     * @apiError Unauthorized If provided access token expired or wrong
     *
     * @apiErrorExample Response (example):
     *     HTTP/1.1 401 Unauthorized
     *     {
     *       "status": "error",
     *       "message": "You have no access rights to perform current action."
     *     }
     *
     * @param {Object} ctx Context of current request
     *
     * @return {Promise<void>}
     */
    static async process(ctx) {
        const validationErrors = GithubEmailsValidator.run(ctx.request);
        if (validationErrors) {
            return ResponseHelper.buildValidationErrorResponse(
                ctx
                , validationErrors
            );
        }

        return GitHubHelper.loadProfiles(ctx.request.body.username)
            .then(accounts => {
                const accountsWithEmails = accounts.filter(el => el.email)
                    , locations = accountsWithEmails.filter(el => el.location)
                        .map(el => el.location)
                ;

                return Promise.all([
                    accountsWithEmails
                    , WeatherHelper.loadAndBuild(locations)
                ]);
            })
            .then(results => {
                const promises = [];

                results[0].forEach(account => {
                    let sign = ``;
                    if (account.location) {
                        sign = results[1][account.location] || sign;
                    }
                    promises.push(MailHelper.send(
                        config.mailFrom
                        , account.email
                        , config.mailSubject
                        , ctx.request.body.message
                        , sign
                    ))
                });

                return Promise.all(promises);
            })
            .then(results => {
                ctx.body = {
                    status: ResponseHelper.STATUS_SUCCESS
                    , number: results.length
                };
            })
            .catch(err => {
                // TODO: handle GitHub API error ?
                // TODO: handle load Weather error ?
                // TODO: handle send email error ?

                throw err;
            })
        ;
    }
}

module.exports = GithubEmailsController;
