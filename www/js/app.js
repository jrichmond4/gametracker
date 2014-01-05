var app = (function () {

	var auth;
	
	var map;

	var showAlert = function () {
		var fn,
		args = arguments;
		if (navigator && navigator.notification && navigator.notification.alert) {
			fn = navigator.notification.alert(msg);
		} else if (typeof alert === "function") {
			fn = alert;
		} else {
			fn = console.log;
		}
		fn.apply(null, args);
	}

	function init() {
		//document.addEventListener('deviceready', function() {
		// FirebaseSimpleLogin demo instantiation		
		$("#loginRegisterBox").popup({
			history : false,
			dismissible: false
		});
		$("#loginBox").popup({
			history : false,
			dismissible: false
		});
		$("#registerBox").popup({
			history : false,
			dismissible: false
		});

		var firebaseRef = new Firebase('https://gametracker.firebaseio.com');
		auth = new FirebaseSimpleLogin(firebaseRef, function (error, user) {
			if (error) {
				// an error occurred while attempting login
				var message = 'An error occurred.';
				showAlert(message, function () {}, 'Failure!', 'Close');
			} else if (user) {
				// user authenticated with Firebase
				$("#loginRegisterBox").popup("close");
				$("#loginBox").popup("close");
				$("#registerBox").popup("close");
				//auth.logout();
				
				map = new GoogleMap();
				map.initialize();
			} else {
				console.log('show login');
				// user is logged out
				showLoginBox();
			}
		});
	}

	function login(provider) {
		if (auth) {
			auth.login(provider);
		}
	}

	function showLoginBox() {
		$("#loginRegisterBox").popup("open");
		
		$("#loginBtn").on("click", function () {
			$("#loginRegisterBox").popup("close");
			$("#loginBox").popup("open");
		});
		$("#goBtn").on("click", function () {
			auth.login('password', {
				email : $("#email").val().trim(),
				password : $("#password").val(),
				rememberMe : $("#rememberme").prop('checked')
			});
		});
		
		$("#register_password, #register_validate_password, #register_email").keyup(function() {
			if($("#registerForm").valid()) {
				$("#signUpBtn").show();
			}
			else {
				$("#signUpBtn").hide();
			}
		});
		
		$("#register_password, #register_validate_password, #register_email").blur(function() {
			if($("#registerForm").valid()) {
				$("#signUpBtn").show();
			}
			else {
				$("#signUpBtn").hide();
			}
		});
		
		$("#registerForm").validate({
			rules: {
				register_email: {
					required: true,
					email: true
				},
				register_password: {
					required: true
				},
				register_validate_password: {
					equalTo: "#register_password"
				}
			},
			messages: {
				register_validate_password: {
					equalTo: "Passwords no not match"
				}
			},
			submitHandler: function(form) {
				var email = $("#register_email").val().trim();
				var password = $("#register_password").val();
				auth.createUser(email, password, function(error,  user) {
					if (!error) {
						//doLogin(user);
						$("#registerBox").popup("close");
						showAlert("Success", function () {}, 'Success!', 'Ok');
						
						map = new GoogleMap();
						map.initialize();
					} else {
						showAlert(error, function () {}, 'Failure!', 'Close');
					}
				});
			}
		});
		
		$("#registerBtn").on("click", function () {
			$("#loginRegisterBox").popup("close");
			$("#registerBox").popup("open");
		});
	};

	return {
		init : init,
		login : login
	};
})();
