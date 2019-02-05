'use strict';

const chai = require(`chai`)
    , chaiHttp = require(`chai-http`);
chai.use(chaiHttp);

const server = require(`../src/server/index`)
    , routeUnderTest = `/sign-up`
    , jsonContentType = `application/json`
;

describe(`Checks Sign Up process`, () => {

    it(`should return 400 error for no params`, (done) => {
        chai.request(server)
            .post(routeUnderTest)
            .end((err, res) => {
                should.not.exist(err);

                res.status.should.eql(400);
                res.type.should.eql(jsonContentType);
                res.body.should.have.property(`status`, `error`);
                res.body.should.have.property(`message`, `Some error`);

                done();
            });
    });

});
