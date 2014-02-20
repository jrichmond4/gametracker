// An example Parse.js Backbone application based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
// the todo items and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("q3qhZPnQKXfmOxUYVQGBkcQc6vDuOaShxYaXsqa7",
                   "JCWcjWy72VXyJ3CdjGI3UEiYAos8rcUrfOy9wTU3");
				   
	// This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });

  // Zone Model
  // ----------

  // Our basic Zone model has 
  var Zone = Parse.Object.extend("Zone", {
    // Default attributes for the todo.
    defaults: {
      bounds: new Array(),
	  name: "Zone"
    },

    // Ensure that each todo created has `content`.
    initialize: function() {
      if (!this.get("bounds")) {
        this.set({"bounds": this.defaults.bounds});
      }
	  if (!this.get("name")) {
        this.set({"name": this.defaults.name});
      }
    },
	
	addMarker: function(location) {
		this.get("bounds").push(location);
	},

    // Toggle the `done` state of this todo item.
    toggle: function() {
      //this.save({done: !this.get("done")});
    }
  }); 
	
  // Zone Collection
  // ---------------

  var ZoneList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Zone,

  });

  // Zone Item View
  // --------------

  // The DOM element for a todo item...
  var ZoneView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    //template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"              : "toggleDone",
      "dblclick label.todo-content" : "edit",
      "click .todo-destroy"   : "clear",
      "keypress .edit"      : "updateOnEnter",
      "blur .edit"          : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Todo and a TodoView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },

    // Re-render the contents of the todo item.
    render: function(map) {
      //$(this.el).html(this.template(this.model.toJSON()));
      //this.input = this.$('.edit');
	  console.log(this.model.get("bounds"));
	  var googleBounds = [];
	  this.model.get("bounds").forEach(function(bound){
		 var myLatLng = new google.maps.LatLng(bound.d, bound.e);
		 googleBounds.push(myLatLng);
	  });
	  var polygon = new google.maps.Polygon({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.1,
				map: map,
				paths: googleBounds
		});
      	return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });
  
  // Map Model
  // ----------

  // Our basic Zone model has 
  var Map = Parse.Object.extend("Map", {
    // Default attributes for the todo.
    defaults: {
		googleMap: null,
		center: new google.maps.LatLng(38.389437, -96.995287),
		zone: new Zone()
    },

    // Ensure that each todo created has `content`.
    initialize: function() {	
		if (!this.get("zone")) {
			this.set({"zone": this.defaults.zone});
		}	
		var mapOptions = {
			 zoom: 16,
			 center: this.get("center"),
			 mapTypeId: google.maps.MapTypeId.HYBRID,
			 disableDoubleClickZoom: true
		 };
			 
        this.googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    },
	
	addListener: function() {
		var that = this;
		google.maps.event.addListener(this.googleMap, 'dblclick', function(event) {
			that.placeMarker(event.latLng);
		});
	},
	
	placeMarker: function(location) {
		var marker = new google.maps.Marker({
			position: location,
			map: this.googleMap
		});
		
		this.get("zone").addMarker(location);
		
	  	//map.setCenter(location);
	},
	
    // Toggle the `done` state of this todo item.
    toggle: function() {
      //this.save({done: !this.get("done")});
    }
  });

  var MapView = Parse.View.extend({
    events: {
      	"click #addArea": "addArea",
		"click #areaDone": "areaDone",
		"click #saveAreaBtn": "saveArea"
    },

    el: "#map-page",
    
    initialize: function() {	
		var self = this;
		 _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'setCenter');
		 
		 this.map = new Map;
		 if (navigator.geolocation) {
			 navigator.geolocation.getCurrentPosition(this.setCenter);
		 }
		
		// Setup the query for the collection to look for todos from the current user
		this.zones = new ZoneList;
      	this.zones.query = new Parse.Query(Zone);
      	this.zones.query.equalTo("user", Parse.User.current());
        
      	this.zones.bind('add',     this.addOne);
      	this.zones.bind('reset',   this.addAll);
      	this.zones.bind('all',     this.render);

      	// Fetch all the todo items for this user
		/*
      	this.zones.fetch({
			success: function() {
				if(self.zones.length > 0) {
					this.map = new Map({center:new google.maps.LatLng(self.zones.models[0].get("bounds").e, self.zones.models[0].get("bounds").d)});
				}
				else {
					this.map = new Map;
				}		
			},
			error: function() {
				console.log("error fetch");		
			}
		});
		*/
		this.zones.fetch();		
		
		state.on("change", this.filter, this);
    },
	
	setCenter: function(position) {
		this.map.googleMap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
	},
	
	addArea: function() {
		var that = this;
		
		this.map.addListener();
		
		$("#right-menu").panel("close");
		showAlert("Double click to place bounding markers, then click 'Area Done'");
	},
	
	areaDone: function() {
		var polygon = new google.maps.Polygon({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.1,
				map: this.map.googleMap,
				paths: this.map.get("zone").get("bounds")
		});
		$("#saveArea").popup("open");	
	},
	
	saveArea: function() {		
		this.zones.create({
			name: 	 $("#area_name").val(),
			bounds:	 this.map.get("zone").get("bounds"),
			user:    Parse.User.current(),
			ACL:     new Parse.ACL(Parse.User.current())
      	});
		
	  	$("#saveArea").popup("close");
	},
	
	filter: function() {
      var filterValue = state.get("filter");
      
      if (filterValue === "all") {
        this.addAll();
      }
    },
	
	// Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(zone) {
      var view = new ZoneView({model: zone});
      //this.$("#todo-list").append(view.render().el);
	  view.render(this.map.googleMap);
    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      //this.$("#todo-list").html("");
      this.zones.each(this.addOne);
    },

    // Only adds some todos, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#todo-list").html("");
      this.todos.chain().filter(filter).each(function(item) { self.addOne(item) });
    },

    render: function() {
      //this.$el.html(_.template($("#login-template").html()));
      //this.delegateEvents();
    }
  });
  
  var RegisterView = Parse.View.extend({
    events: {
      	//"click #signupBtn": "register"
    },

    el: "#registerBox",
    
    initialize: function() {
		var that = this;
		
		$("#registerBox").popup({
			history : false,
			dismissible: false
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
				register_username: {
					required: true,
					//email: true
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
			submitHandler: function() {
				that.register()
			}
		});
		
      _.bindAll(this, "register");
      this.render();
    },

    register: function(e) {
      var self = this;
      var username = this.$("#register_username").val();
      var password = this.$("#register_password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
		  success: function(user) {
			  $("#registerBox").popup("close");
			  //new ManageTodosView();
			  self.undelegateEvents();
			  delete self;
			  
			  showAlert("Success", function () {}, 'Success!', 'Ok');
			  
			  new MapView();
        },

        error: function(user, error) {
          	showAlert(error, function () {}, 'Failure!', 'Close');
        }
      });

      return false;
    },

    render: function() {
      //this.$el.html(_.template($("#login-template").html()));
	  $("#registerBox").popup("open");
      this.delegateEvents();
    }
  });

  var LoginView = Parse.View.extend({
    events: {
      "click #goBtn": "login"
    },

    el: "#loginBox",
    
    initialize: function() {
		$("#loginBox").popup({
			history : false,
			dismissible: false
		});
		
      	this.render();
    },

    login: function(e) {
      var self = this;
      var username = this.$("#username").val();
      var password = this.$("#password").val();
      
      Parse.User.logIn(username, password, {
        success: function(user) {
			$("#loginBox").popup("close");
			new MapView();
				
          	self.undelegateEvents();
          	delete self;
        },

        error: function(user, error) {
          showALert("Invalid username or password. Please try again", function () {}, 'Failure!', 'Close');
        }
      });

      return false;
    },

    render: function() {
      //this.$el.html(_.template($("#login-template").html()));
	  $("#loginBox").popup("open");
      this.delegateEvents();
    }
  });
  
  var LogInRegisterView = Parse.View.extend({
    events: {
      "click #loginBtn": "login",
      "click #registerBtn": "register"
    },

    el: "#loginRegisterBox",
    
    initialize: function() {
      _.bindAll(this, "login", "register");
      this.render();
    },

    login: function(e) {
		$("#loginRegisterBox").popup("close");
      	new LoginView();

      	return false;
    },

    register: function(e) {
		$("#loginRegisterBox").popup("close");
      	new RegisterView();

      	return false;
    },

    render: function() {
      //this.$el.html(_.template($("#login-template").html()));
	  $("#loginRegisterBox").popup({
			history : false,
			dismissible: false
		});
	  $("#loginRegisterBox").popup("open");
      this.delegateEvents();
    }
  });

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
	events: {
      "click #logout": "logout"
    },
	
    el: $("#map-page"),

    initialize: function() {
      this.render();
    },
	
	logout: function() {
		Parse.User.logOut();
      	new LogInView();
      	this.undelegateEvents();
      	delete this;
		showAlert("Logout", function () {}, 'Logout', 'OK');
	},

    render: function() {
      if (Parse.User.current()) {
        new MapView();
      } else {
        new LogInRegisterView();
      }
    }
  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "all": "all",
    },

    initialize: function(options) {
    },

    all: function() {
      state.set({ filter: "all" });
    }
  });

  var state = new AppState;

  new AppRouter;
  new AppView;
  Parse.history.start();
});
