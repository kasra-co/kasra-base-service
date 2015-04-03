'use strict';

var _ = require('lodash');


function registerHandlers() {
}


registerHandlers.prototype.register = function register(handlers,app) {
	var that = this;
	var all = false;

	if(arguments.length === 1) {
		app = handlers;
		all = true;
		handlers = _.functions(this).filter(function(item) {
			return item.indexOf('ErrorHandler') !== -1;
		});

	}

	handlers.forEach(function(handler,k) {
		if(all || _.isFunction(that[handler])) {
			app.use(that[handler]);
		}
	});
};

registerHandlers.prototype.validationErrorHandler = function validationErrorHandler(err, req, res, next) {
	if(err.status && err.status === 705) {
		res.status(500).json(err.errors);
	}
	next(err);
};

registerHandlers.prototype.JSONErrorHandler = function JSONErrorHandler(err, req, res, next) {
	var resp = _.extend({},{status: 500, error: ''});
	if(req.is('application/json')) {
		switch(err.status) {
			case 400: 
				resp.error = 'Invalid JSON Input!';
			break;
			case 705: 
				next(err);
			break;
			default: 
			resp.error = 'Internal error!';
		}
		res.status(500).json(resp);
	}
	next(err);
};

module.exports = function() {
	return new registerHandlers();
};
