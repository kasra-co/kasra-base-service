'use strict';

var util = require( 'util' );

module.exports =
	 {
		accpetJSON: function acceptJSON( req, res, next ) {

			if(!req.accepts('json') || req.get('Accept') === '*/*') {
				res.status( 406 ).json( {error: { message: util.format('Invalid Accept header: %s',req.get('Accept'))}} );
			} else {
				next();
			}
		},
		error404: function(req,res) {
			res.status( 404 ).json( {error: { message: util.format('Not found: %s',req.path)}} );
		}

	};

