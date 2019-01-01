let cities;
const defaultCities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Auckland', 'Queenstown', 'Beijing',
						'Shanghai', 'Shenzhen', 'Guangzhou', 'Xiamen', 'Chongqing', 'Tokyo', 'Osaka', 'Bangkok',
						'Phuket', 'Kuala Lumpur', 'Nandi', 'Doha', 'Istanbul', 'Milano', 'Geneve', 'Zurich', 'Bern',
						'Lausanne', 'Paris', 'Frankfurt am Main', 'Berlin', 'Muenchen', 'Amsterdam', 'Barcelona',
						'London', 'Stockholm', 'Moscow', 'Vancouver', 'Toronto', 'San Francisco', 'Los Angeles', 'Miami',
						'New York City', 'Honolulu', 'Rio de Janeiro'];

let map;

// Scripts for setting up and showing the Leaflet map
function showMap() {
    const ausLat = -25.2744;
    const ausLon = 133.7751;
    const defaultZone = 3;

    map = L.map('map').setView([ausLat, ausLon], defaultZone);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoienN6aG9uZyIsImEiOiJjamx4MWs3YmMwNjRrM3FuOHdjcjR0Nno0In0.NEaoWvImTXFHUsa1gHGZBA'
    }).addTo(map);
}

// Shows marks of all default recommended cities on the map
function showDefaultMarker() {
    let defaultMarkers = new Array(defaultCities.length);

	for (let i = 0; i < defaultCities.length; i++) {
		let city = findCity(defaultCities[i], null);
		let lat = city["lat"];
		let lon = city["lon"];
		let redirectUrl = `/search?city=${city['city']}`;

        defaultMarkers[i] = L.marker([lat, lon]).addTo(map)
            .bindPopup(city["city"] + ', ' + city["country"]);

        defaultMarkers[i].on('click', function () {
            window.location.href = redirectUrl;
        });

        // Pops up to show the city name when a marker is hovered around
        defaultMarkers[i].on('mouseover', function () {
            this.openPopup();
        });
        defaultMarkers[i].on('mouseout', function () {
            this.closePopup();
        });
	}
}

// Shows marks of all photos on the map
function showResultMarkers() {
    const resultZone = 13;
    const photos = document.getElementsByClassName("photosBox");
    const redirectUrls = document.getElementsByClassName("redirectUrls");
    const numPhotos = photos.length;

	let resultMarkers = new Array(numPhotos);

	// Sets the centre view of the map to be the location of the city
	let result = document.getElementById("resultTitle");
    let lat = result.getAttribute("lat");
    let lon = result.getAttribute("lon");

    map.setView([lat, lon], resultZone);

    for (let i = 0; i < numPhotos; i++) {
        // Gets information of photos
        let photoLat = photos[i].getAttribute("lat");
        let photoLon = photos[i].getAttribute("lon");
        let photoSrc = photos[i].getAttribute("src");
        let redirectUrl = redirectUrls[i].getAttribute("href");

        resultMarkers[i] = L.marker([photoLat, photoLon]).addTo(map)
            .bindPopup('<img class="photosPreview" src="' + photoSrc + '"/>');

        resultMarkers[i].on('click', function () {
            window.location.href = redirectUrl;
        })

        // Pops up to preview photos when a marker is hovered around
        resultMarkers[i].on('mouseover', function () {
            this.openPopup();
        });
        resultMarkers[i].on('mouseout', function () {
            this.closePopup();
        });
    }
}

// Shows the marker of the photo selected
function showPhotoMarker() {
    const resultZone = 15;
    let marker;
    let photoUrl = document.getElementById("tagsTitle").getAttribute("photourl");

    let result = document.getElementById("resultTitle");
    let lat = result.getAttribute("lat");
    let lon = result.getAttribute("lon");

    marker = L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], resultZone);

    marker.bindPopup(`<img id="popupPhoto" src="${photoUrl}"/>`, {maxWidth: 900, maxHeight: 700}).openPopup();
}

//**********************************************************************************************************************
// Scripts for getting cities data from the page in order to display the default recommended cities
function getCities() {
	let data = new Array();

	let citiesData = document.getElementsByClassName("cities");

	for (let i = 0; i < citiesData.length; i++) {
		let cityData = citiesData[i].value.split(", ");
		let coordinate = citiesData[i].getAttribute("crd").split(",");

		let line = {
			"city": cityData[0],
			"country": cityData[1],
			"lat": coordinate[0],
			"lon": coordinate[1]
		};
		data.push(line);
	}

	cities = data;
}

// Finds a city's information from the cities data
function findCity(city, country) {
    for (let i = 0; i < cities.length; i++) {
        if (country === null) {
            if (cities[i]["city"].toLowerCase() === city.toLowerCase()) {
                return cities[i];
            }
        }
        else {
            if (cities[i]["city"].toLowerCase() === city.toLowerCase()
				&& cities[i]["country"].toLowerCase() === country.toLowerCase()) {
                return cities[i];
            }
        }
    }
    return null;
}

// Ensures the user does not search with an empty string
function validateSearch(form) {
    if (form.city.value == "") {
        window.alert("You have to enter a city's name to search");
        return false;
    }

    return true;
}

// Redirects to the index page
function returnIndexPage() {
    window.location.href = '/';
}

// Redirects to search for photos about a tag when a tag button is clicked
function searchTag(e) {
    let tag = e.getAttribute("tag");
    let result = document.getElementById("resultTitle");
    let city = result.getAttribute("cityname");
    let country = result.getAttribute("country");
    let lat = result.getAttribute("lat");
    let lon = result.getAttribute("lon");

    tag = joinEmptySpace(tag);
    let redirectUrl = `searchTag?tag=${tag}&city=${city}&country=${country}&lat=${lat}&lon=${lon}`;

    window.location.href = redirectUrl;
}

// Redirects to search for photos with similar tags when the similar-photos button is clicked
function searchSimilar() {
    let tagsList = new Array();
    let result = document.getElementById("resultTitle");
    let city = result.getAttribute("cityname");
    let country = result.getAttribute("country");
    let lat = result.getAttribute("lat");
    let lon = result.getAttribute("lon");
    let ownerTags = document.getElementsByClassName("tagButtons");
    let cTags = document.getElementsByClassName("cTagButtons");

    for (let i = 0; i < ownerTags.length; i++) {
        let ownerTag = ownerTags[i].getAttribute("tag");
        ownerTag = joinEmptySpace(ownerTag);
        tagsList.push(ownerTag);
    }
    for (let i = 0; i < cTags.length; i++) {
        let cTag = cTags[i].getAttribute("tag");
        cTag = joinEmptySpace(cTag);
        tagsList.push(cTag);
    }

    let tags = tagsList.join(",");

    let redirectUrl = `searchSimilar?tags=${tags}&city=${city}&country=${country}&lat=${lat}&lon=${lon}`;

    window.location.href = redirectUrl;
}

// Ensures there is no empty space in any tag which will cause escape chars error in flickr request
function joinEmptySpace(tag) {
    return tag.split(' ').join('-');
}