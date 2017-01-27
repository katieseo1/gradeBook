$(document).ready(function() {
	handleSignUp();
	$('#signup-form').bootstrapValidator({
		container: '#messages',
		fields: {
			firstname: {
				validators: {
					notEmpty: {
						message: 'The  name is required and cannot be empty'
					},
					stringLength: {
						min: 2,
						message: 'The  name must be greater than 2 characters'
					}
				}
			},
			lastname: {
				validators: {
					notEmpty: {
						message: 'The  name is required and cannot be empty'
					},
					stringLength: {
						min: 2,
						message: 'The  name must be greater than 2 characters'
					}
				}
			},
			email: {
				validators: {
					notEmpty: {
						message: 'The email/username cannot be empty'
					},
					stringLength: {
						min: 2,
						message: 'The email/username must be greater than 2 characters'
					}
				}
			},
			password: {
				validators: {
					notEmpty: {
						message: 'The password is required and cannot be empty'
					},
					stringLength: {
						min: 6,
						message: 'The password must be greater than 6 characters'
					}
				}
			},
			confirmPassword: {
				validators: {
					notEmpty: {
						message: 'The password is required and cannot be empty'
					},
					identical: {
						field: 'password',
						message: 'The password and its confirm are not the same'
					}
				}
			},
		}
	}).on('success.field.fv', function(e, data) {
		if (data.fv.getInvalidFields().length > 0) { // There is invalid field
			data.fv.disableSubmitButtons(true);
		}
	});;
});

function signupUser(user) {
	$.ajax({
		method: 'POST',
		url: '/signup',
		data: JSON.stringify(user),
		success: function(data) {
			window.location('/studentList');
		},
		dataType: 'json',
		contentType: 'application/json'
	});
}

function handleSignUp() {
	$('#signupForm').submit(function(e) {
		e.preventDefault();
		signupUser({
			firstname: document.getElementsByName('firstname').trim(),
			lastname: document.getElementsByName('lastname').trim(),
			password: document.getElementsByName('password').trim(),
			email: document.getElementsByName('email').trim()
		});
	});
}
