'use strict';

const GitHub = require(`github-api`);

class GitHubHelper {

    /**
     * Loads profile information about GitHub users
     * @param {string[]} usernameList
     *
     * @return {Promise<Array>}
     */
    static async loadProfiles(usernameList) {
        const gh = new GitHub({
            username: process.env.GITHUB_USERNAME
            , token: process.env.GITHUB_TOKEN
        });
        const promisesList = [];

        usernameList.forEach(username => {
            promisesList.push(gh.getUser(username).getProfile());
        });

        return Promise.all(promisesList)
            .then(results => {
                const profileData = [];

                results.forEach(response => {
                    profileData.push(response.data);
                });

                return profileData;
            })
        ;
    }
}

module.exports = GitHubHelper;
