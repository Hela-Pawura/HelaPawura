var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = { country: "lk" };
var locationData = {};
var infowindow;
var tempData;
var districts = {
  kandy: {
    center: { lat: 7.290572, lng: 80.633728 },
    zoom: 13
  },
  colombo: {
    center: { lat: 6.927079, lng: 79.861244 },
    zoom: 12
  },
  trincomalee: {
    center: { lat: 8.569, lng: 81.233 },
    zoom: 12
  },
  matale: {
    center: { lat: 7.4685, lng: 80.62369 },
    zoom: 12
  },
  gampaha: {
    center: { lat: 7.09115, lng: 79.99963 },
    zoom: 12
  },
  Mullaitivu: {
    center: { lat: 9.22023, lng: 80.79085 },
    zoom: 12
  },
  "Monaragala ": {
    center: { lat: 6.8728, lng: 81.3507 },
    zoom: 12
  },
  Puttalam: {
    center: { lat: 8.026, lng: 79.8471 },
    zoom: 12
  },
  kalutara: {
    center: { lat: 6.58084, lng: 79.96292 },
    zoom: 12
  },
  mannar: {
    center: { lat: 8.981, lng: 79.9044 },
    zoom: 12
  },
  kegalle: {
    center: { lat: 7.1204, lng: 80.3213 },
    zoom: 12
  },
  galle: {
    center: { lat: 6.0402, lng: 80.22064 },
    zoom: 12
  },
  kilinochchi: {
    center: { lat: 9.3803, lng: 80.377 },
    zoom: 12
  },
  matara: {
    center: { lat: 5.94931, lng: 80.535362 },
    zoom: 12
  },
  ratnapura: {
    center: { lat: 6.69311, lng: 80.386436 },
    zoom: 12
  },
  kurunegala: {
    center: { lat: 7.49039, lng: 80.363068 },
    zoom: 12
  },
  badulla: {
    center: { lat: 6.98469, lng: 81.056473 },
    zoom: 12
  },
  jaffna: {
    center: { lat: 9.66528, lng: 80.01852 },
    zoom: 12
  },
  vavuniya: {
    center: { lat: 8.75248, lng: 80.49836 },
    zoom: 12
  },
  polonnaruwa: {
    center: { lat: 7.9403, lng: 81.0188 },
    zoom: 12
  },
  hambantota: {
    center: { lat: 6.1536, lng: 81.1271 },
    zoom: 12
  },
  anuradhapura: {
    center: { lat: 8.31219, lng: 80.418716 },
    zoom: 12
  },
  "nuwara eliya": {
    center: { lat: 6.96861, lng: 80.78394 },
    zoom: 12
  },
  baticaloa: {
    center: { lat: 7.8293, lng: 81.4718 },
    zoom: 12
  },
  ampara: {
    center: { lat: 7.2912, lng: 81.6724 },
    zoom: 12
  }
};

function initMap() {
  infoWindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7.25,
    center: { lat: 7.8774, lng: 80.7003 },
    mapTypeControl: false,
    zoomControl: true,
    streetViewControl: false,
    clickableIcons: false
  });

  //initialize the geocoder
  var geocoder = new google.maps.Geocoder();

  //get data from the DB
  database
    .ref("world/")
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(plc) {
        //place marker for each location
        var marker = new google.maps.Marker({
          position: { lat: plc.val().lat, lng: plc.val().lng },
          map: map,
          placeID: plc.val().placeID,
          placeAddress: "",
          placeName: plc.val().placeName,
          animation: google.maps.Animation.DROP
        });

        //add marker click listener
        marker.addListener("click", function() {
          //close other info windows
          if (infowindow) {
            infowindow.close();
          }
          if (map.zoom < 11) {
            //zoom to marker
            map.setZoom(11);
            map.setCenter(marker.getPosition());
          }

          if (marker.placeAddress == "") {
            geocoder.geocode({ placeId: marker.placeID }, function(
              results,
              status
            ) {
              if (status !== "OK") {
                window.alert("Geocoder failed due to: " + status);
                return;
              }
              marker.placeAddress = results[0]["formatted_address"];

              //create the info window text
              contentString =
                `<h5>` +
                marker.placeName +
                `</h5><div class="address">` +
                marker.placeAddress +
                `</div><bR><br><div class="text-center">
                          <button onclick="showPhotos('` +
                marker.placeID +
                `')" 
                          class="btn btn-primary">Show Photos</button></div>`;
              //create the Info Window
              infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 200
              });
              infowindow.open(map, marker);
            });
          } else {
            //create the info window text
            contentString =
              `<h5>` +
              marker.placeName +
              `</h5><div class="address">` +
              marker.placeAddress +
              `</div><bR><br><div class="text-center">
          <button onclick="showPhotos('` +
              marker.placeID +
              `')" 
          class="btn btn-primary">Show Photos</button></div>`;
            //create the Info Window
            infowindow = new google.maps.InfoWindow({
              content: contentString,
              maxWidth: 200
            });
            infowindow.open(map, marker);
          }
        });

        //Save data from the DB to a local variable
        if (locationData[plc.val()["placeID"]] == undefined) {
          locationData[plc.val()["placeID"]] = { images: [] };
          for (var i = 0; i < plc.val()["images"].length; i++) {
            locationData[plc.val()["placeID"]]["images"].push({
              url: plc.val()["images"][i],
              author: plc.val()["author"]
            });
          }
          locationData[plc.val()["placeID"]]["district"] = plc.val()[
            "district"
          ];
          locationData[plc.val()["placeID"]]["placeName"] = plc.val()[
            "placeName"
          ];
        } else {
          for (var i = 0; i < plc.val()["images"].length; i++) {
            locationData[plc.val()["placeID"]]["images"].push({
              url: plc.val()["images"][i],
              author: plc.val()["author"]
            });
          }
        }
      });
      genStats(snapshot.val(), locationData, snapshot);
    });

  // Create the autocomplete object and associate it with the UI input control.
  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */ (document.getElementById("autocomplete")),
    {
      componentRestrictions: countryRestrict
    }
  );
  places = new google.maps.places.PlacesService(map);
  autocomplete.addListener("place_changed", onPlaceChanged);

  //center to Sri Lanka if the center is moved
  map.addListener("center_changed", function() {
    if (map.zoom < 7.25) {
      window.setTimeout(function() {
        map.panTo({ lat: 7.8774, lng: 80.7003 });
      }, 1000);
    }
  });
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    map.panTo(place.geometry.location);
    map.setZoom(16);
    document.getElementById("autocomplete").value = "";
  } else {
    document.getElementById("autocomplete").placeholder = "Enter a city";
  }
}
