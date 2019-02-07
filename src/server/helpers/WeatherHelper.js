'use strict';

const weather = require(`weather-js`)
    , { sprintf } = require(`sprintf-js`)
    , degreeType = `C`
;

// private methods
const _loadWeather = Symbol(`loadWeather`)
    , _buildMessage = Symbol(`buildMessage`)
;

class WeatherHelper {

    /**
     * Loads weather information and builds info message of it
     * @param {string[]} locations
     *
     * @return {Promise<Object>} Object where key - location, value - weather message
     */
    static async loadAndBuild(locations) {
        const uniqueLocations = [...new Set(locations)]
            , promises = []
            , thisClass = this
        ;
        uniqueLocations.forEach(location => {
            promises.push(thisClass[_loadWeather](location));
        });

        return Promise.all(promises)
            .then(results => {
                const messages = {};
                results[0].forEach((weather, index) => {
                    messages[uniqueLocations[index]] = thisClass[_buildMessage](weather);
                });

                return messages;
            })
    }

    // private

    /**
     * Loads weather info based on provided location
     * @param {string} location
     *
     * @return {Promise<Object>}
     */
    static async [_loadWeather](location) {
        return new Promise((resolve, reject) => {
            weather.find(
                { search: location, degreeType: degreeType }
                , (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    /**
     * Builds info message based on weather info
     * @param {Object} weatherInfo
     *
     * @return {string}
     */
    static [_buildMessage](weatherInfo) {

        console.log(weatherInfo.current);

        return sprintf(
            `It's %s, %s %s degrees in %s`
            , weatherInfo.current.skytext
            , weatherInfo.current.temperature
            , degreeType
            , weatherInfo.current.observationpoint
        );
    }
}

module.exports = WeatherHelper;
