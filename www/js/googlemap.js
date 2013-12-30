function GoogleMap(){
    
    this.initialize = function(){
        var map = showMap();
        //addMarkersToMap(map);
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
}