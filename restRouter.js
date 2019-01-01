const https = require('https');
const FLICKR = require('./flickr.js');
const CLARIFAI = require('./clarifai.js');

// The router class handles the routes for the server
function REST_ROUTER(router, dataLoader) {
	let self = this;
	self.handleRoutes(router, dataLoader);
}

// Handles the routes
REST_ROUTER.prototype.handleRoutes = function(router, dataLoader) {
    // The index page
    router.get("/", function (req, res) {
        let cities = dataLoader.queryCity('*');

        res.render("index", {
            cities: cities,
            failureStatus: 'hidden',
            errorStatus: 'hidden'
        });
    });

    // Processes city search
    router.get("/search", function (req, res) {
        const numPhotos = 50;
        // Gets the search input from the request
        let input = req.query.city.split(', ');
        let searchedCity = input[0];
        let searchedCountry = input[1];

        // Queries all cities for the search bar datalist and the data of a single city searched
        let cities = dataLoader.queryCity('*');
        let resultCity = dataLoader.queryCity(searchedCity, searchedCountry);

        // Returns the index page with a search failure notification to the user when a city searched cannot be found
        if (resultCity === null) {
            res.render("index", {
                cities: cities,
                failureStatus: '',
                errorStatus: 'hidden'
            });
        }
        else {
            const cityAccuracy = 6;

            let flickr = new FLICKR();

            // Searches photos in the city's region
            let options = flickr.createPhotosOption(null, numPhotos, resultCity["lat"], resultCity["lon"], cityAccuracy);

            let flickrReq = https.request(options, function(flickrRes) {
                let photoData = [];
                flickrRes.on('data', function(chunk) {
                    photoData.push(chunk);
                });

                flickrRes.on('end', function() {
                    let photoDataString = photoData.join('');
                    let rsp = JSON.parse(photoDataString);

                    let photos = flickr.getPhotos(rsp, resultCity["city"], resultCity["country"]);

                    res.render("result", {
                        cities: cities,
                        resultTitle: 'Photos in ' + resultCity["city"] + ', ' + resultCity["country"],
                        lat: resultCity["lat"],
                        lon: resultCity["lon"],
                        photos: photos
                    });
                });
            });

            // Handles the error
            flickrReq.on('error', (e) => {
                console.error(e);
                res.render("index", {
                    cities: cities,
                    failureStatus: 'hidden',
                    errorStatus: '',
                    error: 'Error occurred in the request to Flickr API'
                });
            });

            flickrReq.end();
        }
    });

    // When a particular photo is chosen
    router.get("/photo", function (req, res) {
        let photoFarm = req.query.farm;
        let photoServer = req.query.server;
        let photoId = req.query.id;
        let photoSecret = req.query.secret;
        let city = req.query.city;
        let country = req.query.country;
        let lat = req.query.lat;
        let lon = req.query.lon;
        let rawTags = req.query.tags;

        // Queries all cities for the search bar datalist
        let cities = dataLoader.queryCity('*');

        // Gets photo's tags
        let flickr = new FLICKR();
        let photoUrl = flickr.createPhotoUrl(photoFarm, photoServer, photoId, photoSecret);
        let tags = flickr.getPhotoTags(rawTags);

        // Detects tags of the photo using Clarifai
        let clarifai = new CLARIFAI();
        let clarifaiRes = clarifai.predictImage(photoUrl);

        clarifaiRes.then(function(clarifaiData) {
            const numTags = 5;
            let cTags = clarifai.getTags(clarifaiData, numTags);

            // When the owner of the photo did not provide any tag, notify the user about this
            if (tags === null) {
                res.render("photo", {
                    cities: cities,
                    resultCity: city,
                    resultCountry: country,
                    lat: lat,
                    lon: lon,
                    photoUrl: photoUrl,
                    noTag: '',
                    cTags: cTags
                });
            }
            else {
                res.render("photo", {
                    cities: cities,
                    resultCity: city,
                    resultCountry: country,
                    lat: lat,
                    lon: lon,
                    photoUrl: photoUrl,
                    tags: tags,
                    noTag: 'hidden',
                    cTags: cTags
                });
            }
        }).catch(function(clarifaiError) {
            console.log(clarifaiError.toString());
            res.render("index", {
                cities: cities,
                failureStatus: 'hidden',
                errorStatus: '',
                error: 'Error occurred in the request to Clarifai API'
            });
        });
    })

    // Processes search of photos with a tag
    router.get("/searchTag", function (req, res) {
        const numPhotos = 50;
        let tag = req.query.tag;
        let city = req.query.city;
        let country = req.query.country;
        let lat = req.query.lat;
        let lon = req.query.lon;

        // Queries all cities for the search bar datalist
        let cities = dataLoader.queryCity('*');

        const cityAccuracy = 6;

        let flickr = new FLICKR();

        let options = flickr.createPhotosOption(tag, numPhotos, lat, lon, cityAccuracy);

        let flickrReq = https.request(options, function(flickrRes) {
            let photoData = [];
            flickrRes.on('data', function(chunk) {
                photoData.push(chunk);
            });

            flickrRes.on('end', function() {
                let photoDataString = photoData.join('');
                let rsp = JSON.parse(photoDataString);

                let photos = flickr.getPhotos(rsp, city, country);

                res.render("result", {
                    cities: cities,
                    resultTitle: 'Photos with tag "' + tag + '"',
                    lat: lat,
                    lon: lon,
                    photos: photos
                });
            });
        });

        flickrReq.on('error', (e) => {
            console.error(e);
            res.render("index", {
                cities: cities,
                failureStatus: 'hidden',
                errorStatus: '',
                error: 'Error occurred in the request to Flickr API'
            });
        });

        flickrReq.end();
    });

    // Processes search of similar photos
    router.get("/searchSimilar", function (req, res) {
        const numPhotos = 50;
        let tags = req.query.tags;
        let city = req.query.city;
        let country = req.query.country;
        let lat = req.query.lat;
        let lon = req.query.lon;

        // Queries all cities for the search bar datalist
        let cities = dataLoader.queryCity('*');

        const cityAccuracy = 6;

        let flickr = new FLICKR();

        let options = flickr.createPhotosOption(tags, numPhotos, lat, lon, cityAccuracy);

        let flickrReq = https.request(options, function(flickrRes) {
            let photoData = [];
            flickrRes.on('data', function(chunk) {
                photoData.push(chunk);
            });

            flickrRes.on('end', function() {
                let photoDataString = photoData.join('');
                let rsp = JSON.parse(photoDataString);

                let photos = flickr.getPhotos(rsp, city, country);

                res.render("result", {
                    cities: cities,
                    resultTitle: 'Photos with similar tags in ' + city,
                    lat: lat,
                    lon: lon,
                    photos: photos
                });
            });
        });

        flickrReq.on('error', (e) => {
            console.error(e);
            res.render("index", {
                cities: cities,
                failureStatus: 'hidden',
                errorStatus: '',
                error: 'Error occurred in the request to Flickr API'
            });
        });

        flickrReq.end();
    });
}

module.exports = REST_ROUTER;