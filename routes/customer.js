var express = require('express');
var router = express.Router();
var waterfall = require("async/waterfall");

var constants = require('../modules/constants');
var main = require('../modules/main');

var logger = main.getLogger();

/* GET home page. */
router.get('/view', function(req, res, next) {
  res.render('customer');
});

/* GET customers */
router.get('/', function(req, res, next) {
	try {
		var columnNames = ["id", "name", "email_address__c", "phone", "mobile_number__c", "guid__c"];
		var orderBy = columnNames[req.query.order[0].column];
		var direction = req.query.order[0].dir.toUpperCase();
		var limit = req.query.length;
		var offset = req.query.start;
		var filter = req.query.search.value;
		var filterSql = ''; 

		var templateSql = 'SELECT COUNT(1) AS totalRows FROM public."account"';

		res.setHeader('Content-Type','application/json');
		waterfall([
			// Get number of rows in Account
			function(callback) {
				var sql = templateSql;
				var data = [];
				
				main.runQuery(sql, data, function(results) {
					var totalRows = results[0].totalrows;
					callback(null, totalRows);
				}, function(error, sql, data) {
					logger.error('  - Cannot get number of rows in account table: ' + error, error);
					callback(error);
				});
			},
			// Get rows with search word
			function(totalRows, callback) {
				if (filter.length !== 0) {
					filterSql = ' WHERE ("id" LIKE \'%' + filter +
							'%\' OR "name" LIKE \'%' + filter +
							'%\' OR "email_address__c" LIKE \'%' + filter +
							'%\' OR "phone" LIKE \'%' + filter +
							'%\' OR "mobile_number__c" LIKE \'%' + filter + '%\')';
				}

				var sql = templateSql + filterSql;
				var data = [];
				
				main.runQuery(sql, data, function(results) {
					var totalRowsFiltered = results[0].totalrows;
					callback(null, totalRows, totalRowsFiltered);
				}, function(error, sql, data) {
					logger.error('  - Cannot get number of rows in account table (filtered): ' + error, error);
					callback(error);
				});
			},
			// Get rows for a page
			function(totalRows, totalRowsFiltered, callback) {
				var sql =
					'SELECT "id", "name", "email_address__c", "phone", "mobile_number__c", "guid__c" ' +
					'FROM public."account" ' + filterSql + ' ORDER BY "' + orderBy + '" ' + direction + ' LIMIT $1 OFFSET $2';
				var data = [limit, offset];

				main.runQuery(sql, data, function(results) {
					var result = {
						draw: req.query.draw,
						recordsTotal : totalRows,
						recordsFiltered : totalRowsFiltered,
						data : results
					};
					callback(null, result);
				}, function(error, sql, data) {
					logger.error('  - Cannot get rows in account table: ' + error, error);
					callback(error);
				});
		}], function(error, result) {
			if (error) {
				logger.error('  - Cannot get rows in account table: ' + error, error);
				return;
			}
			res.send(JSON.stringify(result));
		});

	} catch (exception) {
		logger.error('Cannot get rows in account table: ' + exception, exception);
	}
});

router.put('/:id', function(req, res) {
	try {
		var id = req.body.id;
		var name = req.body.name;
		var email_address__c = req.body.email_address__c;
		var phone = req.body.phone;
		var mobile_number__c = req.body.mobile_number__c;
		var guid__c = req.body.guid__c;
		
		var sql =
			'UPDATE public."account" ' +
			'SET "name"=$1, "email_address__c"=$2, "phone"=$3, "mobile_number__c"=$4, "guid__c"=$5 ' +
			'WHERE "id"=($6)';
		var data = [name, email_address__c, phone, mobile_number__c, guid__c, id];
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(results) {
			logger.info('- Updating Account -');
			res.status(200).send({
				id: id,
				name: name,
				email_address__c: email_address__c,
				phone: phone,
				mobile_number__c: mobile_number__c,
				guid__c: guid__c
			});
		}, function(error) {
			logger.error('- Cannot edit account "' + id + '" -');
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

module.exports = router;