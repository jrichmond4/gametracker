var app = (function () {

	var auth;
	var userObj;
	var map;

	/*
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
	*/
	function init() {
		//hoodie.account.signUp('jeff.richmond4@gmail.com', 'J4rspyda$');
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
		$("#saveArea").popup({
			history : false,
			dismissible: false
		});
		
		
		/*
		hoodie.account.on('signin', function (user) {
			showAlert("Logged In");	
		});

		if(hoodie.account.username == undefined)
		{
			var result = hoodie.account.signIn('test', 'test');
			console.log(result);
		}
		*/
		
		var firebaseRef = new Firebase('https://gametracker.firebaseio.com');
		auth = new FirebaseSimpleLogin(firebaseRef, function (error, user) {
			if (error) {
				// an error occurred while attempting login
				var message = 'An error occurred.';
				showAlert(message, function () {}, 'Failure!', 'Close');
			} else if (user) {
				// user authenticated with Firebase
				userObj = user;
				$("#loginRegisterBox").popup("close");
				$("#loginBox").popup("close");
				$("#registerBox").popup("close");
				//showAlert("Logged In", function () {}, 'Failure!', 'Close');
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
	}
	
	function escapeEmailAddress(email) {
	  if (!email) return false
	
	  // Replace '.' (not allowed in a Firebase key) with ','
	  email = email.toLowerCase();
	  email = email.replace(/\./g, ',');
	  return email;
	}
	
	function getUserRef() {
		var usersRef = new Firebase('https://gametracker.firebaseio.com/users/');
		return usersRef.child(escapeEmailAddress(userObj.email));
	}
	
	function pushData(location, data) {
		var userRef = getUserRef();
		userRef.child(location).push(data);
	}
	
	function getList(location) {
		var userRef = getUserRef();
		var listRef = userRef.child(location);
		listRef.on('child_added', function(snapshot) {
		  var msgData = snapshot.val();
		  alert(msgData.user_id + ' says ' + msgData.text);
		});	
	}

	return {
		init : init,
		login : login,
		pushData : pushData,
		getList : getList
	};
})();
