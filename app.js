'use strict';

var express = require( 'express' ),
	middleware = require( './middleware' ),
	acceslog = require( 'morgan' );

module.exports = {
	create: function createBaseApp(args) {

		var app = express();

		app.set('logger',args.logger);
		app.set('db',args.db);
		app.set('config',args.config);
		app.use( acceslog( 'dev' ));
		// Add all common middleware here (except for 404)
		app.use( middleware.common.accpetJSON);

		return app;
	}
};
