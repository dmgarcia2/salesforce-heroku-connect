var express = require('express');
var waterfall = require("async/waterfall");

var constants = require('../lib/constants');
var main = require('../lib/main');

var salesforce = require('../lib/salesforce');
var sfdcLabels = require('../lib/sfdc-labels');
var application = require('../lib/application');

var statusServer = require('../statusServer');
var logger = main.getLogger();

var router = express.Router();

router.get('/', function(req, res, next) {
	try {
		waterfall([
			// connect to salesforce
			function(callback) {
				var credentials = {
					clientId: process.env.CONSUMER_KEY,
					clientSecret: process.env.CONSUMER_SECRET,
					username: process.env.CONSUMER_USERNAME,
					password: process.env.CONSUMER_PASSWORD,
					appCallback: process.env.APP_CALLBACK
				};
				salesforce.authenticate(credentials, function(org) {
					callback(null, org);
				}, function(error) {
					callback(error);
				});
			},
			// get Custom Labels
			function(org, callback) {
				sfdcLabels.getCustomLabels(org, function(labels) {
					callback(null, org, labels);
				}, function(error, sql, data) {
					callback(error);
				});
			},
			// disconnect from SalesForce
			function(org, labels, callback) {
				salesforce.disconnect(org, function() {
					callback(null, labels);
				});
			},
			// get applications
			function(labels, callback) {
				application.getApplications(function(applications) {
					callback(null, {
						applications: applications,
						labels: labels
					});
				}, function(error) {
					callback(error, null);
				});
			}
		], function(error, result) {
			if (error) {
				logger.error('  - Cannot show labels page: ' + error, error);
				res.status(500).send({
					error: error
				});

				return;
			}

			var labels = {};
			for (var index = 0; index < result.labels.length; index++) {
				var sobject = result.labels[index];
				var capitalLetter = ('' + sobject.fullName[0]).toUpperCase();

				var group = null;
				if (capitalLetter in labels) {
					group = labels[capitalLetter];
				} else {
					group = [];
					labels[capitalLetter] = group;
				}

				group.push(sobject);
			}
			res.status(200).send({
				applications: result.applications,
				labels: labels
			});
		});

	} catch (exception) {
		logger.error('  - Unhandled exception catched', { 'exception': exception });
		res.status(500).send({
			error: exception
		});
	}
});