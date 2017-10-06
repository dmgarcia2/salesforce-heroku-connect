(function() {
	$(document).ready(function() {
		$(".modal").on("hidden.bs.modal", function() {
			$(this).find("input, output").val('').end();
		});

		var tableMaster = $('#masters').DataTable({
			responsive : true,
			retrieve : true,
			processing : true,
			serverSide : true,
			ajax : "/masterDetail/master",
			columns : [{
				data : "id"
			}, {
				data : "name"
			}, {
				data : "master_external_id__c"
			}, {
				data : "body__c"
			}, {
				data : "systemmodstamp"
			}, {
				data : "createddate"
			}],
			columnDefs : [{
				targets : 6,
				render : function(data, type, full) {
					return '<button type="button" class="btn btn-info" data-toggle="modal" data-target="#editMasterObject" id="editMasterObjectButton"><i class="fa fa-pencil" aria-hidden="true" style="color:white;"></i></button>'
					+ ' <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#deleteMasterO" id="deleteMasterObject"><i class="fa fa-lg fa-trash-o" aria-hidden="true" style="color:white;"></i></button>';
				}
			}, {
				responsivePriority : 1,
				targets : 6
			}]
		});

		// DETAIL
		var tableDetail = $('#details').DataTable({
			responsive : true,
			retrieve : true,
			processing : true,
			serverSide : true,
			ajax : "/masterDetail/detail",
			columns : [{
				data : "id"
			}, {
				data : "name"
			}, {
				data : "heroku_master_detail_poc__c"
			}, {
				data : "heroku_master_poc__c__master_external_id__c"
			}, {
				data : "detail_external_id__c"
			}, {
				data : "body__c"
			}, {
				data : "systemmodstamp"
			}, {
				data : "createddate"
			}],
			columnDefs : [{
				targets : 8,
				render : function(data, type, full) {
					return '<button type="button" class="btn btn-info" data-toggle="modal" data-target="#editDetailObject" id="editDetailObjectButton"><i class="fa fa-pencil" aria-hidden="true" style="color:white;"></i></button>'
					+ ' <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#deleteDetailO" id="deleteDetailObject"><i class="fa fa-lg fa-trash-o" aria-hidden="true" style="color:white;"></i></button>';
				}
			}, {
				responsivePriority : 1,
				targets : 8
			}]
		});
		
		// NEW MASTER DETAIL RECORDS
		$("#createMasterDetailObject").click(function(event) {
			var form = document.getElementById("newMasterDetailObjectForm");
			form.reset();
		});
		
		$("#submit").click(function(event) {
			if($('#newMasterDetailObjectForm').validator('validate').has('.has-error').length === 0){
				var data = {};
				data.name = $('#name').val();
				data.isdeleted = $('#isdeleted').val();
				data.body__c = $('#body__c').val();
				$.ajax({
					type: 'POST',
					url: '/masterDetail',
					data: data,
					dataType: 'json',
					success: function (data) {
						$('#newMasterDetailObject').modal('hide');
						// Update tableMaster
						showNotification("success", 'Master-Detail objects created successfully!');
						tableMaster.row.add( {
						 	"id": data.id,
							"systemmodstamp": data.systemmodstamp,
							"name":   data.name,
							"createddate": data.createddate,
							"body__c": data.body__c,
							"master_external_id__c": data.master_external_id__c
						}).draw();
						
						tableDetail.ajax.reload();

					}, error: function () {
						showNotification("danger", 'We are sorry but our servers are having an issue right now');
					}
				});
			}
		});
		
		$("#masters tbody").on('click', '#editMasterObjectButton', function() {
			var rowIndex = $(this).closest('tr').index();

			$(".modal-body #rowIndex").val(rowIndex);
			
			var id = tableMaster.rows(rowIndex).data()[0].id;
			$(".modal-body #idMasterObject").val(id);
			
			var systemmodstamp = tableMaster.rows(rowIndex).data()[0].systemmodstamp;
			$(".modal-body #masterObjectSystemModStamp").val(systemmodstamp);
			
			var name = tableMaster.rows(rowIndex).data()[0].name;
			$(".modal-body #masterObjectName").val(name);
			
			var createddate = tableMaster.rows(rowIndex).data()[0].createddate;
			$(".modal-body #masterObjectCreatedDate").val(createddate);
			
			var isdeleted = tableMaster.rows(rowIndex).data()[0].isdeleted;
			$(".modal-body #masterObjectIsDeleted").val(isdeleted);
			
			var body__c = tableMaster.rows(rowIndex).data()[0].body__c;
			$(".modal-body #masterObjectBody").val(body__c);
			
			var master_external_id__c = tableMaster.rows(rowIndex).data()[0].master_external_id__c;
			$(".modal-body #masterObjectMasterExternalId").val(master_external_id__c);

			store.set('masterObjectData', {
				id : id,
				systemmodstamp : systemmodstamp,
				name : name,
				createddate : createddate,
				isdeleted : isdeleted,
				body__c : body__c,
				master_external_id__c : master_external_id__c
			});
		});

		$("#editMasterObject").on('click', '#editMaster', function() {
			if($('#updateMasterObjectForm').validator('validate').has('.has-error').length === 0){
				var update = true;
				var data = {}; //Keep order as it is 

				data.id = $('#editMasterObject #idMasterObject').val();
				data.systemmodstamp = $('#editMasterObject #masterObjectSystemModStamp').val();
				data.name = $('#editMasterObject #masterObjectName').val();
				data.createddate = $('#editMasterObject #masterObjectCreatedDate').val();
				data.isdeleted = $('#editMasterObject #masterObjectIsDeleted').val();
				data.body__c = $('#editMasterObject #masterObjectBody').val();
				data.master_external_id__c = $('#editMasterObject #masterObjectMasterExternalId').val();

				if (JSON.stringify(store.get('masterObjectData')).localeCompare(JSON.stringify(data)) == 0) {
					update = false;
				}

				if (update) {
					$.ajax({
						type : 'PUT',
						url : '/masterDetail/' + data.ID,
						data : data,
						dataType : 'json',
						success : function(data) {
							$('#editMasterObject').modal('hide');

							// Update table
							tableMaster.row.add({
								"id" : data.id,
								"systemmodstamp" : data.systemmodstamp,
								"name" : data.name,
								"createddate" : data.createddate,
								"isdeleted" : data.isdeleted,
								"body__c" : data.body__c,
								"master_external_id__c": data.master_external_id__c
							}).draw();

							showNotification("success", 'MasterDetailObject edited successfully!');
						},
						error : function() {
							showNotification("danger", 'We are sorry but our servers are having an issue right now');
						}
					});
				}
			}
		});
		
		$("#masters tbody").on("click", "#deleteMasterObject", function () {
	    	var rowIndex = $(this).closest('tr').index();
	    	$(".modal-body #rowIndex").val(rowIndex);
		});
		
		$("#deleteMasterO").on('click', '#deleteMaster', function () {
			var index = document.getElementById('rowIndex').value;
			var id = tableMaster.rows(index).data()[0].id;
			var data = {};
			data.id = id;
	    	$.ajax({
		    	type: 'DELETE',
		    	url: '/masterDetail/'+id,
		    	data: data,
		    	dataType: 'json',
		     	success: function (data) {
		     		//Update table
					showNotification("success", 'MasterDetail Object deleted successfully!');
		        	tableMaster.row($(this).parents('tr')).remove().draw();
					tableDetail.ajax.reload();
			    }, error: function () {
					showNotification("danger", 'We are sorry but our servers are having an issue right now');
			   	}
			});
		});

		$("#details tbody").on('click', '#editDetailObjectButton', function() {
			var rowIndex = $(this).closest('tr').index();

			$(".modal-body #rowIndex").val(rowIndex);
			
			var id = tableDetail.rows(rowIndex).data()[0].id;
			$(".modal-body #idDetailObject").val(id);
			
			var systemmodstamp = tableDetail.rows(rowIndex).data()[0].systemmodstamp;
			$(".modal-body #detailObjectSystemModStamp").val(systemmodstamp);
			
			var name = tableDetail.rows(rowIndex).data()[0].name;
			$(".modal-body #detailObjectName").val(name);
			
			var createddate = tableDetail.rows(rowIndex).data()[0].createddate;
			$(".modal-body #detailObjectCreatedDate").val(createddate);
			
			var isdeleted = tableDetail.rows(rowIndex).data()[0].isdeleted;
			$(".modal-body #detailObjectIsDeleted").val(isdeleted);
			
			var body__c = tableDetail.rows(rowIndex).data()[0].body__c;
			$(".modal-body #detailObjectBody").val(body__c);
			
			var heroku_master_poc__c__master_external_id__c = tableDetail.rows(rowIndex).data()[0].heroku_master_poc__c__master_external_id__c;
			$(".modal-body #detailObjectHerokuMasterPocMasterExternalId").val(heroku_master_poc__c__master_external_id__c);
			
			var detail_external_id__c = tableDetail.rows(rowIndex).data()[0].detail_external_id__c;
			$(".modal-body #detailObjectDetailExternalId").val(detail_external_id__c);
			
			var heroku_master_detail_poc__c = tableDetail.rows(rowIndex).data()[0].heroku_master_detail_poc__c;
			$(".modal-body #detailObjectHerokuMasterDetailPoc").val(heroku_master_detail_poc__c);

			store.set('detailObjectData', {
				id : id,
				systemmodstamp : systemmodstamp,
				name : name,
				createddate : createddate,
				isdeleted : isdeleted,
				body__c : body__c,
				heroku_master_poc__c__master_external_id__c : heroku_master_poc__c__master_external_id__c,
				detail_external_id__c : detail_external_id__c,
				heroku_master_detail_poc__c : heroku_master_detail_poc__c
			});
		});

		$("#editDetailObject").on('click', '#editDetail', function() {
			if($('#updateDetailDetailObjectForm').validator('validate').has('.has-error').length === 0){
				var update = true;
				var data = {}; //Keep order as it is 

				data.id = $('#editDetailObject #idDetailObject').val();
				data.systemmodstamp = $('#editDetailObject #detailObjectSystemModStamp').val();
				data.name = $('#editDetailObject #detailObjectName').val();
				data.createddate = $('#editDetailObject #detailObjectCreatedDate').val();
				data.isdeleted = $('#editDetailObject #detailObjectIsDeleted').val();
				data.body__c = $('#editDetailObject #detailObjectBody').val();
				data.heroku_master_poc__c__master_external_id__c = $('#editDetailObject #detailObjectHerokuMasterPocMasterExternalId').val();
				data.detail_external_id__c = $('#editDetailObject #detailObjectDetailExternalId').val();
				data.heroku_master_detail_poc__c = $('#editDetailObject #detailObjectHerokuMasterDetailPoc').val();

				if (JSON.stringify(store.get('detailObjectData')).localeCompare(JSON.stringify(data)) == 0) {
					update = false;
				}

				if (update) {
					$.ajax({
						type : 'PUT',
						url : '/masterDetail/detail/' + data.ID,
						data : data,
						dataType : 'json',
						success : function(data) {
							$('#editDetailObject').modal('hide');

							// Update table
							tableDetail.row.add({
								"id" : data.id,
								"systemmodstamp" : data.systemmodstamp,
								"name" : data.name,
								"createddate" : data.createddate,
								"isdeleted" : data.isdeleted,
								"body__c" : data.body__c,
								"heroku_master_poc__c__master_external_id__c": data.heroku_master_poc__c__master_external_id__c,
								"detail_external_id__c": data.detail_external_id__c,
								"heroku_master_detail_poc__c": data.heroku_master_detail_poc__c
							}).draw();

							showNotification("success", 'DetailObject edited successfully!');
						},
						error : function() {
							showNotification("danger", 'We are sorry but our servers are having an issue right now');
						}
					});
				}
			}
		});
		
		$("#details tbody").on("click", "#deleteDetailObject", function () {
	    	var rowIndex = $(this).closest('tr').index();
	    	$(".modal-body #rowIndex").val(rowIndex);
		});
		
		$("#deleteDetailO").on('click', '#deleteDetail', function () {
			var index = document.getElementById('rowIndex').value;
			var id = tableDetail.rows(index).data()[0].id;
			var data = {};
			data.id = id;
	    	$.ajax({
		    	type: 'DELETE',
		    	url: '/masterDetail/detail/'+id,
		    	data: data,
		    	dataType: 'json',
		     	success: function (data) {
		     		//Update table
					showNotification("success", 'Detail Object deleted successfully!');
					tableDetail.row($(this).parents('tr')).remove().draw();
			    }, error: function () {
					showNotification("danger", 'We are sorry but our servers are having an issue right now');
			   	}
			});
		});
	});
}());