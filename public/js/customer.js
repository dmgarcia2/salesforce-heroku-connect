(function() {
	$(document).ready(function() {
		$(".modal").on("hidden.bs.modal", function() {
			$(this).find("input, output").val('').end();
		});

		var table = $('#customers').DataTable({
			responsive : true,
			retrieve : true,
			processing : true,
			serverSide : true,
			ajax : "/customer",
			columns : [{
				data : "id"
			}, {
				data : "name"
			}, {
				data : "email_address__c"
			}, {
				data : "phone"
			}, {
				data : "mobile_number__c"
			}, {
				data : "guid__c"
			}],
			columnDefs : [{
				targets : 6,
				render : function(data, type, full) {
					return '<button type="button" class="btn btn-info" data-toggle="modal" data-target="#editCustomer" id="editCustomerButton"><i class="fa  fa-pencil" aria-hidden="true" style="color:white;"></i></button>';
				}
			}, {
				responsivePriority : 1,
				targets : 6
			}]
		});

		$("#customers tbody").on('click', '#editCustomerButton', function() {
			var rowIndex = $(this).closest('tr').index();

			$(".modal-body #rowIndex").val(rowIndex);
			var id = table.rows(rowIndex).data()[0].id;
			$(".modal-body #idCustomer").val(id);
			var name = table.rows(rowIndex).data()[0].name;
			$(".modal-body #customerName").val(name);
			var email_address__c = table.rows(rowIndex).data()[0].email_address__c;
			$(".modal-body #customerEmail").val(email_address__c);
			var phone = table.rows(rowIndex).data()[0].phone;
			$(".modal-body #customerPhone").val(phone);
			var mobile_number__c = table.rows(rowIndex).data()[0].mobile_number__c;
			$(".modal-body #customerMobile").val(mobile_number__c);
			var guid__c = table.rows(rowIndex).data()[0].guid__c;
			$(".modal-body #customerGuid").val(guid__c);

			store.set('customerData', {
				id : id,
				name : name,
				email_address__c : email_address__c,
				phone : phone,
				mobile_number__c : mobile_number__c,
				guid__c : guid__c
			});
		});

		$("#editCustomer").on('click', '#edit', function() {
			if($('#updateCustomerForm').validator('validate').has('.has-error').length === 0){
				var update = true;
				var data = {}; //Keep order as it is 

				data.id = $('#editCustomer #idCustomer').val();
				data.name = $('#editCustomer #customerName').val();
				data.email_address__c = $('#editCustomer #customerEmail').val();
				data.phone = $('#editCustomer #customerPhone').val();
				data.mobile_number__c = $('#editCustomer #customerMobile').val();
				data.guid__c = $('#editCustomer #customerGuid').val();

				if (JSON.stringify(store.get('customerData')).localeCompare(JSON.stringify(data)) == 0) {
					update = false;
				}

				if (update) {
					$.ajax({
						type : 'PUT',
						url : '/customer/' + data.ID,
						data : data,
						dataType : 'json',
						success : function(data) {
							$('#editCustomer').modal('hide');

							// Update table
							table.row.add({
								"id" : data.id,
								"name" : data.name,
								"email_address__c" : data.email_address__c,
								"phone" : data.phone,
								"mobile_number__c" : data.mobile_number__c,
								"guid__c": data.guid__c
							}).draw();

							showNotification("success", 'Customer edited successfully!');
						},
						error : function() {
							showNotification("danger", 'We are sorry but our servers are having an issue right now');
						}
					});
				}
			}
		});
	});
}());