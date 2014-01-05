function GoogleMap(){
    var map;
	var bounds = [];
	
    this.initialize = function(){
        map = showMap();
        //addMarkersToMap(map);
	  
	  $("#addArea").click(function(e){
		  bounds = new Array();
		  
		  google.maps.event.addListener(map, 'dblclick', function(event) {
			placeMarker(event.latLng);
		  });
		});
		
		$("#areaDone").click(function(e){
			var areaBounds = new google.maps.LatLngBounds();
			for (var i = 0; i < bounds.length; i++) {
				areaBounds.extend(bounds[i]);
			  }
			var polygon = new google.maps.Polygon({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35,
				map: map,
				paths: bounds
			  });
		});
    } 
	
	function placeMarker(location) {
	  var marker = new google.maps.Marker({
		  position: location,
		  map: map
	  });
	  
	  bounds.push(location);
		
	  //map.setCenter(location);
	}   
	
	var showMap = function(){
        var mapOptions = {
			     zoom: 16,
			     center: new google.maps.LatLng(38.389437, -96.995287),
			     mapTypeId: google.maps.MapTypeId.HYBRID
			 }
			 
        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		//Set to terrain view
        //map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        return map;
    }
	
    
    var addMarkersToMap = function(map){
        var mapBounds = new google.maps.LatLngBounds();
    
        var latitudeAndLongitudeOne = new google.maps.LatLng('-33.890542','151.274856');

        var markerOne = new google.maps.Marker({
					position: latitudeAndLongitudeOne,
					map: map
				});
				
        var latitudeAndLongitudeTwo = new google.maps.LatLng('57.77828', '14.17200');

        var markerOne = new google.maps.Marker({
					position: latitudeAndLongitudeTwo,
					map: map
				});
				
        mapBounds.extend(latitudeAndLongitudeOne);
        mapBounds.extend(latitudeAndLongitudeTwo);
        
        map.fitBounds(mapBounds);
    }
}