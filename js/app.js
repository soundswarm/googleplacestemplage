var map;
var infowindow;
var gmarkers = []; // placeholder for google markers
googleMap = {

  // runs all the helper functions
  initMap: function(){
    //center map on these coordinates initially  
    var defaultLocation = {
      coords: {
        latitude: 37.785454, 
        longitude: -122.395406
      }
    };
    var center = {lat: defaultLocation.coords.latitude, lng: defaultLocation.coords.longitude};
    this.buildMap(center);

    // get users gps and recenter map on them
    this.getLocationAndRecenter();

    // get places and display them
    this.getPlaces(this.callback);
    
    // load the autocomplete functionality
    this.loadAutoComplete()
    
    // add event listener to get new places when map moves
    var context = this;
    map.addListener('idle', function() {
     context.getPlaces.call(context);
    });      
  },

  // helper functions
  getLocationAndRecenter: function() {
    var geoOptions = {
       timeout: 5 * 1000,
    };
    var resetCenter = function(location) {
      var center = {lat: location.coords.latitude, lng: location.coords.longitude};
      map.setCenter(center);
    };
    if(navigator.geolocation) {
      console.log('gotgeasdfo');
      navigator.geolocation.getCurrentPosition(resetCenter, console.log, geoOptions);
    } 
  },
  buildMap: function(center) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 15
    });
  },
  getPlaces: function(callback) {
     var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: center,
      radius: 1000,
      types: ['store']
    }, callback.bind(this));
  },
  loadAutoComplete: function (){
    var input = /** @type {!HTMLInputElement} */(
        document.getElementById('pac-input'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);  // Why 17? Because it looks good.
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);
    });
  },
  getPlaces: function() {
    var context = this;
    console.log('this',this);
    var center = {lat: map.center.lat(), lng: map.center.lng()};
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: center,
      radius: 1000,
      types: ['store']
    }, function(results, status) {

      context.callback.call(context, results, status);
    });
  },
  callback: function(markers, status) {
    if(gmarkers.length > 0) {
      gmarkers.forEach(function(marker) {
        marker.setMap(null);
      });
    }
    
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < markers.length; i++) {
        this.createMarker(markers[i]);
      }
    }    
  },
  createMarker: function(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
    // console.log('marker',marker);
    gmarkers.push(marker);
    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }
};


