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
	});
}());