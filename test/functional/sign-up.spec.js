'use strict';

const chai = require(`chai`)
    , chaiHttp = require(`chai-http`)
    , sandbox = require(`sinon`).createSandbox()
    , { sprintf } = require(`sprintf-js`)
    , mongoUnit = require(`mongo-unit`)
    , faker = require(`faker`)
    , request = require(`sync-request`)
;
chai.use(chaiHttp);

const server = require(`../../src/server/index`)
    , ResponseHelper = require(`../../src/server/helpers/ResponseHelper`)
    , AuthHelper = require(`../../src/server/helpers/AuthHelper`)
    , AvatarHelper = require(`../../src/server/helpers/AvatarHelper`)
    , UserModel = require(`../../src/server/models/UserModel`)
    , routeUnderTest = `/sign-up`
    , jsonContentType = `application/json`
;

describe(`Checks Sign Up process`, () => {

    before(() => {
        // TODO: load test data if needed
        // return mongoUnit.start()
        //     .then(testMongoUrl => {
        //         process.env.MONGODB_URI = testMongoUrl;
        //     });
    });

    after(() => {
        return mongoUnit.drop();
    });

    beforeEach(() => {
        sandbox.stub(console, `error`);
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
            , errorMessageInclude: [`email`, `password`, `avatar`]
        }
        , "should return 400 if \"email\" not provided": {
            data: { password: `any`, avatar: `any` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`email`]
        }
        , "should return 400 if \"password\" not provided": {
            data: { email: `any@any.com`, avatar: `any` }
            , statusCode: ResponseHelper.STATUS_CODE_BAD_REQUEST
            , statusMessage: ResponseHelper.STATUS_ERROR
            , errorMessageInclude: [`password`]
        }
        , "should return 400 if \"email\" is wrong email address": {
            data: { email: `any`, password: `any`, avatar: `any` }
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

                    res.status.should.eql(errorDataProvider[message].statusCode);
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

                res.status.should.eql(ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED);
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

                res.status.should.eql(ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED);
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

                res.status.should.eql(ResponseHelper.STATUS_CODE_METHOD_NOT_ALLOWED);
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);

                done();
            });
    });

    it(`should register new user`, () => {
        // given
        const signUpData = {
            email: faker.internet.email()
            , password: faker.internet.password()
        };
        const avatarUrl = faker.image.avatar()
            , avatarName = avatarUrl.split(`/`).pop()
            , uploadedOriginUrl = faker.image.avatar()
            , uploadedThumbUrl = faker.image.avatar()
        ;
        const mockAvatarHelper = sandbox.mock(AvatarHelper);
        mockAvatarHelper.expects(`upload`).once()
            .withArgs(sandbox.match(path => {
                path.should.contain(`/tmp/upload_`);

                return true;
            }))
            .resolves({ origin: uploadedOriginUrl, thumb: uploadedThumbUrl })
        ;

        // when
        return chai.request(server)
            .post(routeUnderTest)
            .field(`email`, signUpData.email)
            .field(`password`, signUpData.password)
            .attach(`avatar`, request(`GET`, avatarUrl).getBody(), avatarName)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_OK
                    , `Request should be successful. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_SUCCESS);
                res.body.should.have.property(`token`);
                res.body.should.have.property(`avatarUrl`, uploadedThumbUrl);

                mockAvatarHelper.verify();

                return Promise.all([
                    AuthHelper.verifyToken(res.body.token)
                    , UserModel.findOne({ email: signUpData.email })
                ]);
            })
            .then(results => {
                results[0].should.equal(
                    signUpData.email
                    , `Token should be decoded to user email address.`
                );

                results[1].should.have.property(
                    `email`
                    , signUpData.email.toLowerCase()
                    , `User "email" should be stored in Db.`
                );
                results[1].should.have.property(`passwordHash`);
                results[1].should.have.property(
                    `avatarOriginUrl`
                    , uploadedOriginUrl
                    , `User "avatarOriginUrl" should be stored in Db.`
                );
                results[1].should.have.property(
                    `avatarThumbUrl`
                    , uploadedThumbUrl
                    , `User "avatarThumbUrl" should be stored in Db.`
                );

                return AuthHelper.compare(
                    signUpData.password
                    , results[1].passwordHash
                );
            })
            .then(compareResult => {
                compareResult.should.equal(
                    true
                    , `Right password hash should be stored in Db.`
                );
            })
        ;
    });

    it(`should return 400 error if user already registered`, async () => {
        // given
        const signUpData = {
            email: faker.internet.email()
            , password: faker.internet.password()
        };
        const avatarUrl = faker.image.avatar()
            , avatarName = avatarUrl.split(`/`).pop()
            , uploadedOriginUrl = faker.image.avatar()
            , uploadedThumbUrl = faker.image.avatar()
            , passwordHash = `any`
        ;

        await mongoUnit.load({
            users: [
                {
                    email: signUpData.email.toLowerCase()
                    , passwordHash: passwordHash
                    , avatarOriginUrl: uploadedOriginUrl
                    , avatarThumbUrl: uploadedThumbUrl
                }
            ]
        });

        const mockAvatarHelper = sandbox.mock(AvatarHelper);
        mockAvatarHelper.expects(`upload`).never();

        // when
        return chai.request(server)
            .post(routeUnderTest)
            .field(`email`, signUpData.email)
            .field(`password`, signUpData.password)
            .attach(`avatar`, request(`GET`, avatarUrl).getBody(), avatarName)
            .then(res => {
                res.status.should.eql(
                    ResponseHelper.STATUS_CODE_BAD_REQUEST
                    , `Bad Request response should be returned. Body: ` + JSON.stringify(res.body)
                );
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, ResponseHelper.STATUS_ERROR);
                res.body.should.have.property(`message`);
                res.body.message.should.contain(
                    `email`
                    , `Error message should contain "email" keyword.`
                );

                mockAvatarHelper.verify();

                return UserModel.findOne({ email: signUpData.email });
            })
            .then(userModelData => {
                should.exist(
                    userModelData
                    , sprintf(`User with email: "%s" should exists.`, signUpData.email)
                );

                userModelData.should.have.property(
                    `email`
                    , signUpData.email.toLowerCase()
                    , `User "email" should not be changed in Db.`
                );
                userModelData.should.have.property(
                    `passwordHash`
                    , passwordHash
                    , `User "passwordHash" should not be changed in Db.`
                );
                userModelData.should.have.property(
                    `avatarOriginUrl`
                    , uploadedOriginUrl
                    , `User "avatarOriginUrl" should not be changed in Db.`
                );
                userModelData.should.have.property(
                    `avatarThumbUrl`
                    , uploadedThumbUrl
                    , `User "avatarThumbUrl" should not be changed in Db.`
                );
            });
    });

    // TODO : add test for wrong file type sending
    // TODO : add test for fail avatar upload
    // TODO : add test for fail password hash generation
    // TODO : add test for fail access token generation

});
