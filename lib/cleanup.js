'use strict';

function cleanup() {
}

cleanup.prototype.register = function register(app) {

	process.on('SIGINT', function() {
		process.exit();
	});

	process.on('SIGHUP', function() {
		process.exit();
	});

	process.on('SIGTERM', function() {
		process.exit();
	});

	process.on('exit', function() {

		var db = app.get('db');

		app.get('logger').info('Exiting.. cleanup');

		if(db) {
			if(db.done) {
				db.done();
			}
			db.end();
		}
	});

};

module.exports = function() {
	return new cleanup();
};