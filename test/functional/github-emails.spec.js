'use strict';

const chai = require(`chai`)
    , chaiHttp = require(`chai-http`)
    , sandbox = require(`sinon`).createSandbox()
    , { sprintf } = require(`sprintf-js`)
    , mongoUnit = require(`mongo-unit`)
    , faker = require(`faker`)
    , config = require(`../../config`)
;
chai.use(chaiHttp);

const server = require(`../../src/server/index`)
    , ResponseHelper = require(`../../src/server/helpers/ResponseHelper`)
    , AuthHelper = require(`../../src/server/helpers/AuthHelper`)
    , GitHubHelper = require(`../../src/server/helpers/GitHubHelper`)
    , WeatherHelper = require(`../../src/server/helpers/WeatherHelper`)
    , MailHelper = require(`../../src/server/helpers/MailHelper`)
    , routeUnderTest = `/github-emails`
    , jsonContentType = `application/json`
    , accessTokenHeader = `X-Access-Token`
    , userData = {
        email: faker.internet.email()
        , password: faker.internet.password()
        , avatarOriginUrl: faker.image.avatar()
        , avatarThumbUrl: faker.image.avatar()
    }
;

let accessToken = null;

describe(`Checks GithubEmails process`, () => {

    before(() => {
        return mongoUnit.load({
            users: [
                {
                    email: userData.email.toLowerCase()
                    , passwordHash: userData.password
                    , avatarOriginUrl: userData.avatarOriginUrl
                    , avatarThumbUrl: userData.avatarThumbUrl
                }
            ]
        }).then(() => {
            return AuthHelper.buildToken(userData.email);
        }).then(token => {
            accessToken = token;
        });
    });

    after(() => {
        return mongoUnit.drop();
    });

    beforeEach(() => {
        sandbox.stub(console, `error`); // to clear tests running log in terminal
    });

    afterEach(() => {
        // completely restore all fakes created through the sandbox
        sandbox.restore();
    });

    it(`should return 405 code for GET request`, (done) => {
        chai.request(server)
            .get(routeUnderTest)
            .end((err, res) => {
                should.not.exist(err);

                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED
                    , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);

                done();
            });
    });

    it(`should return 405 code for PUT request`, (done) => {
        chai.request(server)
            .put(routeUnderTest)
            .end((err, res) => {
                should.not.exist(err);

                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED
                    , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);

                done();
            });
    });

    it(`should return 405 code for DELETE request`, (done) => {
        chai.request(server)
            .delete(routeUnderTest)
            .end((err, res) => {
                should.not.exist(err);

                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED
                    , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);

                done();
            });
    });

    it(`should return 401 code for request without token`, () => {
        return chai.request(server)
            .post(routeUnderTest)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_UNAUTHORIZED
                    , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);
            });
    });

    it(`should return 401 code for request with wrong token`, () => {
        return chai.request(server)
            .post(routeUnderTest)
            .set(accessTokenHeader, `any`)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_UNAUTHORIZED
                    , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);
            });
    });

    it(`should return 401 code for request with wrong email in token`, async () => {
        return chai.request(server)
            .post(routeUnderTest)
            .set(accessTokenHeader, await AuthHelper.buildToken(`email`))
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_UNAUTHORIZED
                    , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);
            });
    });

    const errorDataProvider = {
        "should return 400 error on empty request body": {
            data: ``
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`username`, `message`]
        }
        , "should return 400 if \"username\" not provided": {
            data: { message: `any` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`username`]
        }
        , "should return 400 if \"message\" not provided": {
            data: { username: `some` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`message`]
        }
        , "should return 400 if \"username\" is empty string": {
            data: { username: ``, message: `any` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`username`]
        }
    };

    for (let message in errorDataProvider) {
        it(message, () => {
            return chai.request(server)
                .post(routeUnderTest)
                .set(accessTokenHeader, accessToken)
                .send(errorDataProvider[message].data)
                .then(res => {
                    res.status.should.eql(
                        errorDataProvider[message].statusCode
                        , `Response code should be correct one. Body: ` + JSON.stringify(res.body)
                    );
                    res.type.should.eql(jsonContentType);
                    res.body.should.have.property(
                        `status`
                        , errorDataProvider[message].statusMessage
                    );
                    res.body.should.have.property(`message`);
                    errorDataProvider[message].errorMessageInclude.forEach(keyName => {
                        res.body.message.should.contain(
                            keyName
                            , sprintf(
                                `Response "message" should contain "%s" property error info.`
                                , keyName
                            )
                        );
                    });
                });
        });
    }

    it(`should send email successfully`, async () => {
        // given
        const username = [
                faker.internet.userName().toLowerCase()
                , faker.internet.userName().toLowerCase()
            ]
            , message = faker.random.words()
            , emails = [`serapheem013@gmail.com`, `serapheem@inbox.ru`]
            // , emails = [faker.internet.email(), faker.internet.email()]
            , locations = [faker.address.country(), faker.address.country()]
            , weather = [faker.random.words(), faker.random.words()]
            , gitHubProfiles = [
                { login: username[0], email: emails[0], location: locations[0] }
                , { login: username[1], email: emails[1], location: locations[1] }
            ]
        ;

        const mockGitHubHelper = sandbox.mock(GitHubHelper);
        mockGitHubHelper.expects(`loadProfiles`)
            .once().withArgs(username)
            .resolves(gitHubProfiles)
        ;

        const mockWeatherHelper = sandbox.mock(WeatherHelper)
            , weatherResult = {}
        ;
        weatherResult[locations[0]] = weather[0];
        weatherResult[locations[1]] = weather[1];
        mockWeatherHelper.expects(`loadAndBuild`)
            .once().withArgs(locations)
            .resolves(weatherResult)
        ;

        const mockMailHelper = sandbox.mock(MailHelper);
        mockMailHelper.expects(`send`)
            .twice()
            .withArgs(
                config.mailFrom
                , sandbox.match.string
                , config.mailSubject
                , message
                , sandbox.match.string
            )
            .resolves(true)
        ;

        // when
        return chai.request(server)
            .post(routeUnderTest)
            .set(accessTokenHeader, accessToken)
            .send({ username: username.join(`,`) + `,,`, message: message })
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_OK
                    , `Request should be successful. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_SUCCESS);
                res.body.should.have.deep.property(
                    `number`
                    , emails.length
                    , `Email should be sent to all recipients.`
                );

                mockGitHubHelper.verify();
                mockWeatherHelper.verify();
                mockMailHelper.verify();
            })
        ;
    });

    // TODO : add test for fail access token verify
    // TODO : add test for null email address
    // TODO : add test for null location
    // TODO : add test for duplicate location
    // TODO : add test for fail email sent

});
