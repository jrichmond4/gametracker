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
};

// initialize Hoodie
// hoodie = new Hoodie('localhost:6004/_api');