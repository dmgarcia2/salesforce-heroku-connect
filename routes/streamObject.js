var express = require('express');
var router = express.Router();
var waterfall = require("async/waterfall");
var uniqid = require('uniqid');
var uuidv4 = require('uuid/v4');

var constants = require('../modules/constants');
var main = require('../modules/main');

var logger = main.getLogger();

var dbSchema = process.env.DATABASE_SCHEMA || 'public';

router.get('/view', function(req, res) {
	try {
		res.render('streamObject');
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});
router.get('/', function(req, res) {
	try {
		var columnNames = ["id", "systemmodstamp", "name", "createddate","isdeleted","body__c","external_guid__c"];
		var orderBy = columnNames[req.query.order[0].column];
		var direction = req.query.order[0].dir.toUpperCase();
		var limit = req.query.length;
		var offset = req.query.start;
		var filter = req.query.search.value;
		var filterSql = ''; 

		var templateSql = 'SELECT COUNT(1) AS totalRows FROM ' + dbSchema + '."heroku_poc__c"';

		res.setHeader('Content-Type','application/json');
		waterfall([
			// Get number of rows in User agents
			function(callback) {
				var sql = templateSql;
				var data = [];
				
				main.runQuery(sql, data, function(results) {
					var totalRows = results[0].totalrows;
					callback(null, totalRows);
				}, function(error, sql, data) {
					logger.error('  - Cannot get number of rows in heroku_poc__c table: ' + error, error);
					callback(error);
				});
			},
			// Get rows with search word
			function(totalRows, callback) {
				if (filter.length !== 0) {
					filterSql = ' WHERE (CAST("id" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("systemmodstamp" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("name" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("createddate" AS TEXT) LIKE \'%' + filter + 
							'%\' OR CAST("isdeleted" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("body__c" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("external_guid__c" AS TEXT) LIKE \'%' + filter +'%\')';
				}

				var sql = templateSql + filterSql;
				var data = [];
				
				main.runQuery(sql, data, function(results) {
					var totalRowsFiltered = results[0].totalrows;
					callback(null, totalRows, totalRowsFiltered);
				}, function(error, sql, data) {
					logger.error('  - Cannot get number of rows in heroku_poc__c table (filtered): ' + error, error);
					callback(error);
				});
			},
			// Get rows for a page
			function(totalRows, totalRowsFiltered, callback) {
				var sql =
					'SELECT "id", "systemmodstamp", "name", "createddate", "isdeleted", "body__c", "external_guid__c" FROM ' + dbSchema + '."heroku_poc__c" ' + filterSql +
						' ORDER BY "' + orderBy + '" ' + direction + ' LIMIT $1 OFFSET $2';
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
					logger.error('  - Cannot get rows in heroku_poc__c table: ' + error, error);
					callback(error);
				});
			}
			], function(error, result) {
			if (error) {
				logger.error('  - Cannot get rows in heroku_poc__c table: ' + error, error);
				return;
			}
			res.send(JSON.stringify(result));
		});

	} catch (exception) {
		logger.error('Cannot get rows in heroku_poc__c table: ' + exception, exception);
	}
});

router.post('/', function(req, res) {
	try {
		var systemmodstamp = '20170920 103243';
		var name = req.body.name;
		var createddate = '20170920 103243';
		var isdeleted = req.body.isdeleted;
		var body__c = req.body.body__c;
		
		var guid = uuidv4();
		
		console.log("systemmodstamp: "+systemmodstamp);
		
		var columns = '"systemmodstamp", "name", "createddate", "isdeleted", "body__c", "external_guid__c"';
		var values = 'to_timestamp($1, \'YYYYMMDD HH24MISS\'), $2, to_timestamp($3, \'YYYYMMDD HH24MISS\'), $4, $5, $6';
		var data = [systemmodstamp, name, createddate, isdeleted, body__c, guid];
		
		var sql = 'INSERT INTO ' + dbSchema + '."heroku_poc__c" (' + columns + ') VALUES (' + values + ') RETURNING "id"';
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(id) {
			logger.info('- New stream object created -');
			res.status(200).send({
				id: id,
				systemmodstamp: systemmodstamp,
				name: name,
				createddate: createddate,
				isdeleted: isdeleted,
				body__c: body__c,
				external_guid__c: guid
				});
		}, function(error) {
			logger.error('- Cannot insert new stream object -');
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

router.put('/:id', function(req, res) {
	try {
		var id = req.body.id;
		var systemmodstamp = req.body.systemmodstamp;
		var name = req.body.name;
		var createddate = req.body.createddate;
		var isdeleted = req.body.isdeleted;
		var body__c = req.body.body__c;
		var external_guid__c = req.body.external_guid__c;
		
		var sql =
			'UPDATE ' + dbSchema + '."heroku_poc__c" ' +
			'SET "systemmodstamp"=$1, "name"=$2, "createddate"=$3, "isdeleted"=$4, "body__c"=$5, "external_guid__c"=$6 ' +
			'WHERE "id"=($7)';
		var data = [systemmodstamp, name, createddate, isdeleted, body__c, external_guid__c, id];
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(results) {
			logger.info('- Updating heroku_poc__c -');
			res.status(200).send({
				id: id,
				systemmodstamp: systemmodstamp,
				name: name,
				createddate: createddate,
				isdeleted: isdeleted,
				body__c: body__c,
				external_guid__c: external_guid__c
			});
		}, function(error) {
			logger.error('- Cannot edit heroku_poc__c "' + id + '" -');
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

router.delete('/:streamObject_id', function(req, res) {
	try {
		var id = req.body.id;
		var sql = 'DELETE FROM ' + dbSchema + '."heroku_poc__c" WHERE "id"=($1)';
		var data = [id];
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(results) {
			logger.info('- Deleting Stream object -');
			res.status(200).send({ ok : "ok" });
		}, function(error) {
			logger.error('- Cannot delete Stream object -');
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

module.exports = router;
