const fsSync = require('fs-sync');

// The class extracts data of cities from a csv file and provides some functions to query from the data
function DATA_LOADER(path) {
    this.path = path;
    this.data = this.loadData();
}

// Loads the data from the csv file
DATA_LOADER.prototype.loadData = function() {
    const rawData = fsSync.read(this.path).split('\n');

    let data = new Array();
    // The last line in the raw data will be skipped as it is an empty string after the previous split
    for (let i = 0; i < rawData.length-1; i++) {
        let dataLine = rawData[i].split(';');

        // Removes the quotation marks of each value in the raw data line
        let city = dataLine[2].split('"')[1];
        let country = dataLine[1].split('"')[1];
        let lat = dataLine[3].split('"')[1];
        let lon = dataLine[4].split('"')[1];

        // Ensures outliers (incorrect data set) will not be taken
        if (city != undefined && country != undefined && lat != undefined && lon != undefined) {
            data.push({
                "city": dataLine[2].split('"')[1],
                "country": dataLine[1].split('"')[1],
                "lat": dataLine[3].split('"')[1],
                "lon": dataLine[4].split('"')[1]
            })
        }
    }
    return data;
}

// Queries a city based on the name of the city and country
DATA_LOADER.prototype.queryCity = function(city, country) {
    if (city === '*') {
        return this.data;
    }
    else {
        // When the user search with only the city's name
        if (country == undefined) {
            for (let i = 0; i < this.data.length; i++) {
                if (city.toLowerCase() === this.data[i]["city"].toLowerCase()) {
                    return this.data[i];
                }
            }
        }
        // When search with both city and country
        else {
            for (let i = 0; i < this.data.length; i++) {
                if (city.toLowerCase() === this.data[i]["city"].toLowerCase()
                    && country.toLowerCase() === this.data[i]["country"].toLowerCase()) {
                    return this.data[i];
                }
            }
        }
        return null;
    }
}

module.exports = DATA_LOADER;