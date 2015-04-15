'use strict';

var _ = require('lodash'),
	os = require('os'),
	fs = require( 'fs' ),
	logger = require( 'kasra-logger' ),
	db = require( 'kasra-db' ),
	https = require( 'https' ),
	prg = require('commander'),
	mainApp = require( '../app' );


function Initializer(options,config) {
	this.options = options;
	this.appConfig = config;
}

Initializer.prototype.fatal = function fatal() {
	var args = Array.prototype.slice.apply(arguments);
	args = args.map(function(item) {
		if(_.isObject(item)) {
			return JSON.stringify(item);
		} else {
			return item;
		}
	});
	/*jshint validthis:true */
	if(logger.error) {
		logger.error.apply(this,args);
	} else {
		/* global console */
		console.error.apply(this,args);
	}
  	/*jshint validthis:false */
	process.exit(1);
};

Initializer.prototype.initCmd =function initCmd(callback) {

	prg.version(this.appConfig.service.version).
	option('-t, --test <boolean>', 'Test mode connects to test database.',false).
	option('-l, --logging <integer>', 'Log messages to console (1), log errors using third-party service (2), or do not log at all (0).',1).
	option('-i, --insecure <boolean>', 'If true, requests sent to unauthorized SSL endpoints will work and self signed certificates can be used to run the HTTPS server. Should be used on localhost only.',false).
	option('-d, --dev <boolean>','Dev mode: logging=1, insecure=1, test=1',false);

	if(this.options.arguments) {
		this.options.arguments.forEach(function(k,opt) {
			prg.option.apply(this,_.values(opt));
		},this);
	} else {
		prg.parse(process.argv);
	}

	if(prg.insecure) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	if(prg.dev) {
		prg.logging = 1;
		prg.test = true;
		prg.insecure = true;
	}

	this.options.logging.mode = prg.logging;

	if(this.options.db) {
		this.options.db.testdb = prg.test;
	}

	callback(null,prg);

};


Initializer.prototype.initLogger = function initLogger(cli,callback) {

	logger.init(_.pick(this.options,'logging'),function(err,loggerInst) {
		if(err) {
			return callback(err);
		}
		callback(null,cli,loggerInst);
	});
};

Initializer.prototype.initDb = function initDb(cli,loggerInst,callback) {

	if(this.options.db) {
		db.init(_.pick(this.options,'db'),this.appConfig,function(err,dbconn) {
			if(err) {
				return callback(err);
			}
			callback(null,cli,loggerInst,dbconn);
		});
	} else {
		callback(null,cli,loggerInst,null);
	}

};

Initializer.prototype.initService = function initService(cli,loggerInst,dbconn,callback) {
	var app = null, server = null, certificate = null;
	var hostname = os.hostname();
	var port = this.appConfig.service.port;

	var listener = function listener() {
		app.set( 'host', server.address().address );
		app.set( 'port', server.address().port );

		if(certificate) {
			app.set( 'certificate', certificate);
		}

		loggerInst.info( 'Serving', 'at', app.get( 'host' ), 'on port', port, 'ssl:',this.options.ssl, 'testdb:', cli.test );

		callback(null,app,cli);
	}.bind(this);

	try {

		app = mainApp.create( {logger: loggerInst, config: this.appConfig, db: dbconn } );

		if(this.options.ssl) {
			certificate = {
				key: this.options.ssl.key  ? this.options.ssl.key : fs.readFileSync('../../cert/'+hostname+'.key'),
				cert: this.options.ssl.cert  ? this.options.ssl.cert : fs.readFileSync('../../cert/'+hostname+'.crt')
			};

			server = https.createServer(certificate, app).listen(port, listener);

		} else {
			server = app.listen( port, listener);
		}
	}
	catch(e) {
		callback([e]);
	}

};


module.exports = function(options,appConfig) {
	return new Initializer(options,appConfig);
};