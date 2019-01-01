const express = require("express");
const bodyParser  = require("body-parser");
const DATA_LOADER = require("./dataLoader.js");
const REST_ROUTER = require("./restRouter.js");

const app  = express();

const port = 3000;

// The REST server handles the basic configurations
function REST() {
	let self = this;
    self.dataLoader = new DATA_LOADER('./cities.csv');
    self.configure(self.dataLoader);
}

// Configures the server
REST.prototype.configure = function(dataLoader) {
	let self = this;
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	let router = express.Router();
	app.use('', router);

    app.use(express.static(__dirname + '/views/'));
	app.set('view engine', 'hbs');

	new REST_ROUTER(router, dataLoader);
	self.startServer();
}

// Starts the server
REST.prototype.startServer = function() {
	app.listen(port, function() {
		console.log('Express app listening at http://localhost:'+port+'/');
	});
}

new REST;