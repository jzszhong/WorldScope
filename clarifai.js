const Clarifai = require('clarifai');

// The class handles the use of Clarifai API to predict photos and secure tags
function CLARIFAI() {
    this.app = new Clarifai.App({
        apiKey: 'c0eaec2a70184925b8e38368217b8a8d'
    });
}

// Predicts an image using general model
CLARIFAI.prototype.predictImage = function(imageUrl) {
    return this.app.models.predict(Clarifai.GENERAL_MODEL, imageUrl);
}

// Transforms tags of an image detected, from Clarifai's raw response data
CLARIFAI.prototype.getTags = function(clarifaiData, numTagsToReturn) {
    let rawTags = clarifaiData.outputs[0].data.concepts;
    let tags = new Array();

    // Makes sure when there are no that many tags as needed it returns only the tags classified
    if (rawTags.length < numTagsToReturn) {
        numTagsToReturn = rawTags.length;
    }

    for (let i = 0; i < numTagsToReturn; i++) {
        tags.push({"tag": rawTags[i].name});
    }

    return tags;
}

module.exports = CLARIFAI;