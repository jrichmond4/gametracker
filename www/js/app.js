var app = (function() {

  var auth;

  var showAlert = function() {
    var fn, args = arguments;
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
	  $("#loginBox").popup({history:false});
	  
      var firebaseRef = new Firebase('https://gametracker.firebaseio.com');
      auth = new FirebaseSimpleLogin(firebaseRef, function(error, user) {
        if (error) {
          // an error occurred while attempting login
          var message = 'An error occurred.';
          showAlert(message, function(){}, 'Failure!', 'Close');

        } else if (user) {
          // user authenticated with Firebase
          var message = 'User ID: ' + user.id + ', Provider: ' + user.provider;
          showAlert(message, function(){}, 'Success!', 'Close');

          // Log out so we can log in again with a different provider.
          auth.logout();

        } else {
          // user is logged out
		  showLoginBox();
        }
      });
    //}, false);
  }

  function login(provider) {
    if (auth) {
      auth.login(provider);  
    }
  }
  
  function showLoginBox() {
	  $("#loginBox").popup("open");
	  $("#loginBtn").on("click", function() {
		var email = $("#email").val();
		var password = $("#password").val();
		auth.login('password', {
			email: email,
			password: password
		}, function(error,  user) {
		  if (!error) {
			  doLogin(user);
			$("#loginBox").popup("close");
			alert("Success!");
		  } else {
			alert(error);
		  }
		});
	  });
		/*
		auth.createUser(email, password, function(error,  user) {
		  if (!error) {
			doLogin(user);
		  } else {
			alert(error);
		  }
		});
	  });
	  */
	}

  return {
    init: init,
    login: login
  };
})();
