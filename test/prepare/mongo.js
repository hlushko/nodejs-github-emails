'use strict';

const prepare = require(`mocha-prepare`)
    , mongoUnit = require(`mongo-unit`)
;

prepare(done => {
    mongoUnit.start()
        .then(testMongoUrl => {
            process.env.MONGODB_URI = testMongoUrl;

            done();
        });
}, done => {
    mongoUnit.stop().then(() => {
        done();
    });
});
