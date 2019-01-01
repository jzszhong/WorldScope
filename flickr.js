// The class handles the the data of request to and respond from Flickr
function FLICKR() {
    const key = "d951b6de8c0eaad9343c51f799ee1e3b";

    this.api_key = key;
    this.format = 'json';
    this.nojsoncallback = 1;
}

// Creates the option to search for photos as a request URL
FLICKR.prototype.createPhotosOption = function(tags, number, lat, lon, accuracy) {
    let path = '/services/rest/?' +
        'method=flickr.photos.search' +
        `&api_key=${this.api_key}`;

    if (tags != null) {
        path += `&tags=${tags}`;
    }

    path += `&per_page=${number}` +
        `&format=${this.format}` +
        `&nojsoncallback=${this.nojsoncallback}` +
        `&lat=${lat}` +
        `&lon=${lon}` +
        `&accuracy=${accuracy}` +
        '&min_upload_date=1514764800' +
        '&sort=relevance' +
        '&has_geo=1' +
        '&extras=geo,tags';

    let options = {
        hostname: 'api.flickr.com',
        port: 443,
        path: path,
        method: 'GET'
    };
    return options;
}

// Makes a list of data of photos including some important properties
FLICKR.prototype.getPhotos = function(rsp, city, country) {
    let photos = new Array();
    for (let i = 0; i < rsp.photos.photo.length; i++) {
        let photo = rsp.photos.photo[i];
        let url = this.createPhotoUrl(photo.farm, photo.server, photo.id, photo.secret);

        photos.push({
            "url": url,
            "farm": photo.farm,
            "server": photo.server,
            "id": photo.id,
            "secret": photo.secret,
            "lat": photo.latitude,
            "lon": photo.longitude,
            "tags": photo.tags,
            "photoCity": city,
            "photoCountry": country
        });
    }
    return photos;
}

// Makes a URL to show a photo image
FLICKR.prototype.createPhotoUrl = function(farm, server, id, secret) {
    return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}_z.jpg`;
}

// Transforms a raw tag-string into a set of tags of a photo
FLICKR.prototype.getPhotoTags = function(rawTags) {
    // In case the photo has no tags
    if (rawTags === '') {
        return null;
    }

    let maxNumTags = 10;
    let tagList = rawTags.split(' ');
    let tags = new Array();

    // Ensures the max number of tags will not be more than the actual number of tags obtained
    if (tagList.length < maxNumTags) {
        maxNumTags = tagList.length;
    }

    for (let i = 0; i < maxNumTags; i++) {
        tags.push({"tag": tagList[i]});
    }

    return tags;
}

module.exports = FLICKR;