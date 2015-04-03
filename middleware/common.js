'use strict';

var util = require( 'util' );

module.exports =
	 {
		accpetJSON: function acceptJSON( req, res, next ) {

			if(req.get('Accept') !== 'application/json') {
				res.status( 400 ).json( {error: { meassge: util.format('Invalid Accept header: %s',req.get('Accept'))}} );
			} else {
				next();
			}
		},
		error404: function(req,res) {
			res.status( 404 ).json( {error: { meassge: util.format('Not found: %s',req.path)}} );
		}

	};

