'use strict';

var util = require('util');
var _ = require('lodash');

module.exports = {
	print: function print() {
		var args = Array.prototype.slice.call(arguments);
		var format = args[0];

		args.shift();

		args = args.map(function(item) {
			if(_.isObject(item) || Array.isArray(item)) {
				return JSON.stringify(item);
			} else {
				return item;
			}
		});

		return util.format(format,args);
	}
};