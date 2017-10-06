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
		res.render('masterDetail');
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

router.get('/master', function(req, res) {
	try {
		var columnNames = ["id", "name","master_external_id__c","body__c","systemmodstamp","createddate"];
		var orderBy = columnNames[req.query.order[0].column];
		var direction = req.query.order[0].dir.toUpperCase();
		var limit = req.query.length;
		var offset = req.query.start;
		var filter = req.query.search.value;
		var filterSql = ''; 

		var templateSql = 'SELECT COUNT(1) AS totalRows FROM ' + dbSchema + '."heroku_master_poc__c"';

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
					logger.error('  - Cannot get number of rows in heroku_master_poc__c table: ' + error, error);
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
							'%\' OR CAST("master_external_id__c" AS TEXT) LIKE \'%' + filter +'%\')';
				}

				var sql = templateSql + filterSql;
				var data = [];
				
				main.runQuery(sql, data, function(results) {
					var totalRowsFiltered = results[0].totalrows;
					callback(null, totalRows, totalRowsFiltered);
				}, function(error, sql, data) {
					logger.error('  - Cannot get number of rows in heroku_master_poc__c table (filtered): ' + error, error);
					callback(error);
				});
			},
			// Get rows for a page
			function(totalRows, totalRowsFiltered, callback) {
				var sql =
					'SELECT "id", "systemmodstamp", "name", "createddate", "isdeleted", "body__c", "master_external_id__c" FROM ' + dbSchema + '."heroku_master_poc__c" ' + filterSql +
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
					logger.error('  - Cannot get rows in heroku_master_poc__c table: ' + error, error);
					callback(error);
				});
			}
			], function(error, result) {
			if (error) {
				logger.error('  - Cannot get rows in heroku_master_poc__c table: ' + error, error);
				return;
			}
			res.send(JSON.stringify(result));
		});

	} catch (exception) {
		logger.error('Cannot get rows in heroku_master_poc__c table: ' + exception, exception);
	}
});

router.get('/detail', function(req, res) {
	try {
		var columnNames = ["id","name","heroku_master_detail_poc__c","heroku_master_poc__c__master_external_id__c","detail_external_id__c","body__c","systemmodstamp","createddate"];
		var orderBy = columnNames[req.query.order[0].column];
		var direction = req.query.order[0].dir.toUpperCase();
		var limit = req.query.length;
		var offset = req.query.start;
		var filter = req.query.search.value;
		var filterSql = ''; 

		var templateSql = 'SELECT COUNT(1) AS totalRows FROM ' + dbSchema + '."heroku_detail_poc__c"';

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
					logger.error('  - Cannot get number of rows in heroku_detail_poc__c table: ' + error, error);
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
							'%\' OR CAST("heroku_master_detail_poc__c" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("heroku_master_poc__c__master_external_id__c" AS TEXT) LIKE \'%' + filter +
							'%\' OR CAST("detail_external_id__c" AS TEXT) LIKE \'%' + filter +'%\')';
				}

				var sql = templateSql + filterSql;
				var data = [];
				
				main.runQuery(sql, data, function(results) {
					var totalRowsFiltered = results[0].totalrows;
					callback(null, totalRows, totalRowsFiltered);
				}, function(error, sql, data) {
					logger.error('  - Cannot get number of rows in heroku_detail_poc__c table (filtered): ' + error, error);
					callback(error);
				});
			},
			// Get rows for a page
			function(totalRows, totalRowsFiltered, callback) {
				var sql =
					'SELECT "id", "systemmodstamp", "name", "createddate", "isdeleted", "body__c", "heroku_master_detail_poc__c", "heroku_master_poc__c__master_external_id__c", "detail_external_id__c" FROM ' +
						dbSchema + '."heroku_detail_poc__c" ' + filterSql +
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
					logger.error('  - Cannot get rows in heroku_detail_poc__c table: ' + error, error);
					callback(error);
				});
			}
		], function(error, result) {
			if (error) {
				logger.error('  - Cannot get rows in heroku_detail_poc__c table: ' + error, error);
				return;
			}
			res.send(JSON.stringify(result));
		});

	} catch (exception) {
		logger.error('Cannot get rows in heroku_detail_poc__c table: ' + exception, exception);
	}
});

router.post('/', function(req, res) {
	try {
		var name = req.body.name;
		var body__c = req.body.body__c;
		
		res.setHeader('Content-Type','application/json');
		waterfall([
			// New master record
			function(callback) {
				var guid = uuidv4();
				var columns = '"name", "body__c", "master_external_id__c"';
				var values = '$1, $2, $3';
				var data = [name, body__c, guid];
				
				var sql = 'INSERT INTO ' + dbSchema + '."heroku_master_poc__c" (' + columns + ') VALUES (' + values + ') RETURNING "id"';

				main.runQuery(sql, data, function(id) {
					logger.info('- New master object created - ' + JSON.stringify(id));
					result = {
						id: id[0].id,
						name: name,
						body__c: body__c,
						master_external_id__c: guid
					};
					callback(null, result);

				}, function(error) {
					logger.error('- Cannot insert new master object -');
					callback(error);
				});
			},
			// New detail record
			function(result, callback) {
				var guid = uuidv4();
				var columns = '"name", "body__c", "heroku_master_poc__c__master_external_id__c", "detail_external_id__c"';
				var values = '$1, $2, $3, $4';
				var data = ['Detail1-' + name, 'Detail1-' + body__c, result.master_external_id__c, guid];
				/*var columns = '"name", "heroku_master_poc__c__master_external_id__c", "detail_external_id__c"';
				var values = '$1, $2, $3';
				var data = ['Detail1-' + name, result.master_external_id__c, guid];*/
				
				var sql = 'INSERT INTO ' + dbSchema + '."heroku_detail_poc__c" (' + columns + ') VALUES (' + values + ') RETURNING "id"';

				main.runQuery(sql, data, function(id) {
					logger.info('- New detail object created -');
					result.details = [];
					result.details.push({
						id: id[0].id,
						detail_external_id__c: guid
					});
					callback(null, result);

				}, function(error) {
					logger.error('- Cannot insert new detail object -');
					callback(error);
				});
			},
			// New detail record
			function(result, callback) {
				var guid = uuidv4();
				var columns = '"name", "body__c", "heroku_master_poc__c__master_external_id__c", "detail_external_id__c"';
				var values = '$1, $2, $3, $4';
				var data = ['Detail2-' + name, 'Detail2-' + body__c, result.master_external_id__c, guid];
				
				var sql = 'INSERT INTO ' + dbSchema + '."heroku_detail_poc__c" (' + columns + ') VALUES (' + values + ') RETURNING "id"';

				main.runQuery(sql, data, function(id) {
					logger.info('- New detail object created -');
					result.details.push({
						id: id[0].id,
						detail_external_id__c: guid
					});
					callback(null, result);

				}, function(error) {
					logger.error('- Cannot insert new detail object -');
					callback(error);
				});
			}
		], function(error, result) {
			if (error) {
				logger.error('  - Cannot get rows in heroku_detail_poc__c table: ' + error, error);
				return;
			}

			res.status(200).send({
				id: result.id,
				systemmodstamp: '20170920 103243',
				name: result.name,
				createddate: '20170920 103243',
				isdeleted: false,
				body__c: result.body__c,
				master_external_id__c: result.master_external_id__c
			});
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
		var master_external_id__c = req.body.master_external_id__c;
		
		var sql =
			'UPDATE ' + dbSchema + '."heroku_master_poc__c" ' +
			'SET "name"=$1, "body__c"=$2 ' +
			'WHERE "id"=($3)';
		var data = [name, body__c, id];
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(results) {
			logger.info('- Updating heroku_master_poc__c -');
			res.status(200).send({
				id: id,
				systemmodstamp: systemmodstamp,
				name: name,
				createddate: createddate,
				isdeleted: isdeleted,
				body__c: body__c,
				master_external_id__c: master_external_id__c
			});
		}, function(error) {
			logger.error('- Cannot edit heroku_master_poc__c "' + id + '" -');
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

		res.setHeader('Content-Type','application/json');
		waterfall([
			// New master record
			function(callback) {
				var sql = 'DELETE FROM ' + dbSchema + '."heroku_detail_poc__c" WHERE "heroku_master_detail_poc__c"=($1)';
				var data = [id];
				
				main.runQuery(sql, data, function(results) {
					logger.info('- Deleting Detail objects -');
					callback(null);
				}, function(error) {
					logger.error('- Cannot delete heroku_detail_poc__c object -');
					callback(error);
				});
			},
			// New detail record
			function(callback) {
				var sql = 'DELETE FROM ' + dbSchema + '."heroku_master_poc__c" WHERE "id"=($1)';
				var data = [id];
				
				main.runQuery(sql, data, function(results) {
					logger.info('- Deleting Master object -');
					callback(null);
				}, function(error) {
					logger.error('- Cannot delete heroku_master_poc__c object -');
					callback(error);
				});
			}
		], function(error, result) {
			if (error) {
				logger.error('  - Cannot get rows in heroku_detail_poc__c table: ' + error, error);
				return;
			}

			res.status(200).send({ ok : "ok" });
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

router.put('/detail/:id', function(req, res) {
	try {
		var id = req.body.id;
		var systemmodstamp = req.body.systemmodstamp;
		var name = req.body.name;
		var createddate = req.body.createddate;
		var isdeleted = req.body.isdeleted;
		var body__c = req.body.body__c;
		var heroku_master_poc__c__master_external_id__c = req.body.heroku_master_poc__c__master_external_id__c;
		var detail_external_id__c = req.body.detail_external_id__c;
		var heroku_master_detail_poc__c = req.body.heroku_master_detail_poc__c;
		
		var sql =
			'UPDATE ' + dbSchema + '."heroku_detail_poc__c" ' +
			'SET "name"=$1, "body__c"=$2 ' +
			'WHERE "id"=($3)';
		var data = [name, body__c, id];
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(results) {
			logger.info('- Updating heroku_master_poc__c -');
			res.status(200).send({
				id: id,
				systemmodstamp: systemmodstamp,
				name: name,
				createddate: createddate,
				isdeleted: isdeleted,
				body__c: body__c,
				heroku_master_poc__c__master_external_id__c: heroku_master_poc__c__master_external_id__c,
				detail_external_id__c: detail_external_id__c,
				heroku_master_detail_poc__c: heroku_master_detail_poc__c
			});
		}, function(error) {
			logger.error('- Cannot edit heroku_master_poc__c "' + id + '" -');
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

router.delete('/detail/:streamObject_id', function(req, res) {
	try {
		var id = req.body.id;
		var sql = 'DELETE FROM ' + dbSchema + '."heroku_detail_poc__c" WHERE "id"=($1)';
		var data = [id];
		
		res.setHeader('Content-Type','application/json');
		main.runQuery(sql, data, function(results) {
			logger.info('- Deleting Detail object -');
			res.status(200).send({ ok : "ok" });
		}, function(error) {
			logger.error('- Cannot delete heroku_detail_poc__c object -');
		});
		
	} catch (exception) {
		logger.error('  - Unhandled exception catched', exception);
		res.status(500).send({
			error: exception
		});
	}
});

module.exports = router;
