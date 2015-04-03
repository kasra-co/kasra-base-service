'use strict';

var async = require( 'async'),
	middleware = require( './middleware' ),
	cleanup = require( './lib/cleanup' ),
	errorHandler = require( 'errorhandler' ),
	customErrorHandlers = require( './lib/error-handlers'),
	_ = require('lodash');


module.exports = {
	fatal: null,
	libs: require('./lib/exports'),
	afterRoutes: function(app) {

		// Middlewares which have to be registered after the routes..

		// Error handlers..
		customErrorHandlers().register(app);

		// Cleanup on exit / crash
		cleanup().register(app);

		// Other middlewares

		if( 'development' === app.get( 'env' )) {
			app.use( errorHandler() ); // For debugging errors in routes
		}

		app.use(middleware.common.error404);

		return app;

	},
	init: function(options,appConfig,callback) {

		var that = this;
		var initializer = null;

		if(arguments.length === 2) {
			callback = appConfig;
			appConfig = options;
			options = {};
		}

		options = _.defaults(options, {
			ssl: false,
			db: {
				type: 'mongo',
				testdb: false
			},
			logging: {
				mode: null,
				dir: './log',
				levels: [
					{ name: 'errors', filename: 'errors.log',timestamp: true,  handleExceptions: true, level: 'info' }
				]
			}
		});

		initializer = require( './lib/init')(options,appConfig);

		async.waterfall([
			function(cb) {
				initializer.initCmd(cb);
			},
			function(cli,cb) {
				initializer.initLogger(cli,cb);
			},
			function(cli,logger,cb) {
				initializer.initDb(cli,logger,cb);
			},
			function(cli,logger,dbconn, cb) {
				initializer.initService(cli,logger,dbconn,cb);
			}
			], function (err, app, prg) {
				if(err) {
					initializer.fatal.apply(this, err);
				}

				that.fatal = initializer.fatal;

				callback.call(that,app,prg);
		});
	}
};







