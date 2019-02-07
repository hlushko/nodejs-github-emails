'use strict';

const chai = require(`chai`)
    , chaiHttp = require(`chai-http`)
    , sandbox = require(`sinon`).createSandbox()
    , { sprintf } = require(`sprintf-js`)
    , mongoUnit = require(`mongo-unit`)
    , faker = require(`faker`)
;
chai.use(chaiHttp);

const server = require(`../../src/server/index`)
    , ResponseHelper = require(`../../src/server/helpers/ResponseHelper`)
    , AuthHelper = require(`../../src/server/helpers/AuthHelper`)
    , routeUnderTest = `/sign-in`
    , jsonContentType = `application/json`
;

describe(`Checks SignIn process`, () => {

    before(() => {
        // load test data if needed
        // return mongoUnit.load({
        //     users: [
        //         {
        //             email: `any`
        //             , passwordHash: `any`
        //             , avatarOriginUrl: `any`
        //             , avatarThumbUrl: `any`
        //         }
        //     ]
        // });
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

    const errorDataProvider = {
        "should return 400 error on empty request body": {
            data: ``
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`email`, `password`]
        }
        , "should return 400 if \"email\" not provided": {
            data: { password: `any` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`email`]
        }
        , "should return 400 if \"password\" not provided": {
            data: { email: `any@any.com` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`password`]
        }
        , "should return 400 if \"email\" is wrong email address": {
            data: { email: `any`, password: `any` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`email`]
        }
    };

    for (let message in errorDataProvider) {
        it(message, (done) => {
            chai.request(server)
                .post(routeUnderTest)
                .send(errorDataProvider[message].data)
                .end((err, res) => {
                    should.not.exist(err);

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

                    done();
                });
        });
    }

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

    it(`should SignIn successfully`, async () => {
        // given
        const signInData = {
            email: faker.internet.email()
            , password: faker.internet.password()
        };
        const uploadedOriginUrl = faker.image.avatar()
            , uploadedThumbUrl = faker.image.avatar()
        ;

        // load fixtures
        await mongoUnit.drop();
        await mongoUnit.load({
            users: [
                {
                    email: signInData.email.toLowerCase()
                    , passwordHash: await AuthHelper.hash(signInData.password)
                    , avatarOriginUrl: uploadedOriginUrl
                    , avatarThumbUrl: uploadedThumbUrl
                }
            ]
        });

        // when
        return chai.request(server)
            .post(routeUnderTest)
            .send(signInData)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_OK
                    , `Request should be successful. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_SUCCESS);
                res.body.should.have.property(`token`);
                res.body.should.have.property(`email`, signInData.email.toLowerCase());
                res.body.should.have.property(`avatarUrl`, uploadedThumbUrl);
                res.body.should.have.property(`originAvatarUrl`, uploadedOriginUrl);

                return AuthHelper.verifyToken(res.body.token);
            })
            .then(decodedToken => {
                decodedToken.should.equal(
                    signInData.email
                    , `Token should be decoded to user email address.`
                );
            })
        ;
    });

    it(`should not SignIn with wrong pass`, async () => {
        // given
        const signInData = {
            email: faker.internet.email()
            , password: faker.internet.password()
        };
        const uploadedOriginUrl = faker.image.avatar()
            , uploadedThumbUrl = faker.image.avatar()
        ;

        // load fixtures
        await mongoUnit.drop();
        await mongoUnit.load({
            users: [
                {
                    email: signInData.email.toLowerCase()
                    , passwordHash: faker.random.alphaNumeric(32)
                    , avatarOriginUrl: uploadedOriginUrl
                    , avatarThumbUrl: uploadedThumbUrl
                }
            ]
        });

        // when
        return chai.request(server)
            .post(routeUnderTest)
            .send(signInData)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_BAD_REQUEST
                    , `400 status code should be returned. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);

                res.body.should.have.property(`message`);
                res.body.message.should.contain(`email`);
                res.body.message.should.contain(`password`);

                res.body.should.not.have.property(`token`);
                res.body.should.not.have.property(`email`);
                res.body.should.not.have.property(`avatarUrl`);
                res.body.should.not.have.property(`originAvatarUrl`);
            });
    });

    it(`should not SignIn with non existing email`, async () => {
        // given
        const signInData = {
            email: faker.internet.email()
            , password: faker.internet.password()
        };

        // load fixtures
        await mongoUnit.drop();

        // when
        return chai.request(server)
            .post(routeUnderTest)
            .send(signInData)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_BAD_REQUEST
                    , `400 status code should be returned. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);

                res.body.should.have.property(`message`);
                res.body.message.should.contain(`email`);
                res.body.message.should.contain(`password`);

                res.body.should.not.have.property(`token`);
                res.body.should.not.have.property(`email`);
                res.body.should.not.have.property(`avatarUrl`);
                res.body.should.not.have.property(`originAvatarUrl`);
            });
    });

    // TODO : add test for fail password hash compare
    // TODO : add test for fail access token verify

});
