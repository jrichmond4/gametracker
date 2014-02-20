Built.initialize('blt3b2cb3913ffb2790', 'blt30954daa2a9e3fbb');	

// Keep app self-contained
var myApp = (function($) {
	
	var session;

  	var initialize = function() {
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
		$("#logout").click(function(e) {
			//Built.User.logout();
			Built.User.clearSession()
		});
		
		if (Parse.User.current()) {
		  new ManageTodosView();
		} else {
		  new LogInView();
		}
		
		var loggedIn = Built.User.getSession();
		if(loggedIn) {
		  	session = Built.User.getSession();
		  	$("#loginRegisterBox").popup("close");
			$("#loginBox").popup("close");
			$("#registerBox").popup("close");
			//showAlert("Logged In", function () {}, 'Failure!', 'Close');
			//auth.logout();
			
			map = new GoogleMap();
			map.initialize();
		}
		else {
			showLoginBox();
		}
  };
  
  function login(username, password) {
	  Built.User.login(
	  	username,
		password,
		{
			onSuccess: function(data, res) {
				// data.application_user will contain the profile
				session = data.application_user;
				Built.User.saveSession();
				Built.User.setCurrentUser(Built.User.getSession());
				$("#loginRegisterBox").popup("close");
				$("#loginBox").popup("close");
				$("#registerBox").popup("close");
				//showAlert("Logged In", function () {}, 'Failure!', 'Close');
				//auth.logout();
				
				map = new GoogleMap();
				map.initialize();
    		},
			onError: function(error) {
				showAlert(error.error_message, function () {}, 'Error', 'Ok');
				showLoginBox();
			}
    	}
    );
  }
  
  function showLoginBox() {
		$("#loginRegisterBox").popup("open");
		
		$("#loginBtn").on("click", function () {
			$("#loginRegisterBox").popup("close");
			$("#loginBox").popup("open");
		});
		$("#goBtn").on("click", function () {
			login($("#username").val(), $("#password").val());
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
				var user = {email: email, password: password, password_confirmation: password};
				Built.User.register(user, {
	  				onSuccess: function(data) {
						session = data.application_user;
						$("#registerBox").popup("close");
						showAlert("Success", function () {}, 'Success!', 'Ok');
						
						map = new GoogleMap();
						map.initialize();
	  				},
					onError: function(err) {
						showAlert(err, function () {}, 'Failure!', 'Close');
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
		Built.User.getCurrentUser();
	}
	
	function pushData(location, data) {
		var userRef = getUserRef();
		userRef.child(location).push(data);
	}
	
	/*
	function getList(location) {
		var userRef = getUserRef();
		var listRef = userRef.child(location);
		listRef.on('child_added', function(snapshot) {
		  var msgData = snapshot.val();
		  alert(msgData.user_id + ' says ' + msgData.text);
		});	
	} 
	*/ 

  return {
    initialize: initialize,
	pushData : pushData,
	//getList : getList
  };

}(jQuery));

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};
