'use strict';

var _ = require('lodash');

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
			_.forOwn(db,function(dbInst,dbName) {

				if(dbInst.connection.done) {
					dbInst.connection.done();
				}

				dbInst.connection.end();
			});
		}
	});

};

module.exports = function() {
	return new cleanup();
};