//hide the wrapper
$("#upload-wrapper").hide();

var provider = new firebase.auth.FacebookAuthProvider();
var user;
var totalFiles = 0;
var uploadedFiles = 0;
var autocomplete;
var countryRestrict = { country: "lk" };
var marker;
var selectedLocation = { lat: 0, lng: 0 };
var database = firebase.database();
var imageUrlList = [];

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
  mullaitivu: {
    center: { lat: 9.22023, lng: 80.79085 },
    zoom: 12
  },
  monaragala: {
    center: { lat: 6.8728, lng: 81.3507 },
    zoom: 12
  },
  puttalam: {
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
  "nuwara-eliya": {
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

$("#sign-in-fb-btn").click(function() {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
    });
});

//on firebase auth change
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    user = firebase.auth().currentUser;
    //hide the must sign in div
    $("#must-login-container").hide();
    $("#upload-wrapper").show();
    $("#loading-spinner").hide();

    var email = "";
    if (user.email == undefined) {
      email = "";
    } else {
      email = user.email;
    }

    //save user data to DB
    d = {
      name: user.displayName,
      email: user.email,
      lastLogin: Date.now(),
      photoURL: user.photoURL
    };
    firebase
      .database()
      .ref("users/" + user.uid)
      .update(d);
  } else {
    $("#must-login-container").show();
    $("#upload-wrapper").hide();
    $("#loading-spinner").hide();

    user = firebase.auth().currentUser;
  }
});

//handle file upload button press
$("#upload-btn").click(function() {
  dist = $("#district").val();

  //Get files
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert("The File APIs are not fully supported in this browser.");
    return;
  }

  //get giles from input
  fileInput = document.getElementById("file");
  totalFiles = fileInput.files.length;
  files = fileInput.files;
  if (!fileInput.files) {
    alert(
      "This browser doesn't seem to support the `files` property of file inputs."
    );
  } else if (!fileInput.files[0]) {
    alert("Please select a file before clicking 'Load'");
  } else if (totalFiles > 10) {
    alert("Please choose a maximum of 10 images");
  } else if (dist == "0") {
    alert("Please select your district");
  } else if (selectedLocation["lat"] == 0 || selectedLocation["lng"] == 0) {
    alert("Please select your location");
  } else {
    //disable all inputs
    $("#upload-btn").prop("disabled", true);
    $("#file").prop("disabled", true);
    $("#district").prop("disabled", true);
    $("#location").prop("disabled", true);
    $("#spinner").show();

    //for each on all  files array
    if (files) {
      [].forEach.call(files, function(file) {
        //this func runs on all images. gets the image File and converts to base 64 , attach a listener and sends to comp()

        // Make sure `file.name` matches our extensions criteria
        if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
          var reader = new FileReader();
          reader.addEventListener(
            "load",
            function() {
              comp(reader["result"])
                .then(function(blob) {
                  uploadImageAsPromise(blob);
                })
                .catch(e => {
                  console.log(e);
                });
            },
            false
          );
          reader.readAsDataURL(file);
        } else {
          alert("Images only");
        }
      });
    }
  }
});

//function to handle the uploading process
//Handle waiting to upload each file using promise
function uploadImageAsPromise(imageFile) {
  return new Promise(function(resolve, reject) {
    var pathImageName =
      String(Date.now()) + String(Math.floor(Math.random() * 1000)) + ".jpg";
    var storageRef = firebase
      .storage()
      .ref("images/" + user.uid + "/" + pathImageName);

    //Upload file
    var task = storageRef.put(imageFile);

    //Update progress bar
    task.on(
      "state_changed",
      function progress(snapshot) {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        value = percentage;
      },
      function error(err) {},
      function success() {
        task.snapshot.ref.getDownloadURL().then(function(url) {
          uploadedFiles += 1;
          imageUrlList.push(url);
          checkUploadCompletion();
        });
      }
    );
  });
}

//check if all selected files uploaded
function checkUploadCompletion() {
  if (totalFiles == uploadedFiles) {
    dist = $("#district").val();
    timestamp = Date.now();
    author = user.displayName;

    //then Upload everything to Firebase (Fuck yeah)
    //prepare the data
    data = {
      uid: user.uid,
      lat: selectedLocation["lat"],
      lng: selectedLocation["lng"],
      district: dist,
      timestamp: timestamp,
      images: imageUrlList,
      author: author,
      placeID: selectedLocation["placeID"],
      placeName: selectedLocation["placeName"]
    };

    //push to world data
    database
      .ref("world/")
      .push(data)
      .then(
        function(k) {
          $("#upload-wrapper").hide();
          $("#map").hide();
          $("#done").show();
          key = k.key;
          //push to User data
          database.ref("users/" + user.uid + "/contributions/").push(key);
        },
        error => {
          alert(error);
        }
      );
  }
}

//**************  MAP STUFF  ********  */
//Initialize the map
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 7.8774, lng: 80.7003 },
    zoom: 7,
    gestureHandling: "cooperative",
    mapTypeControl: false,
    zoomControl: true,
    streetViewControl: false
  });

  // Create the autocomplete object and associate it with the UI input control.
  // Restrict the search to the default country, and to place type "cities".
  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */ (document.getElementById(
      "locationSearch"
    )),
    {
      componentRestrictions: countryRestrict
    }
  );
  places = new google.maps.places.PlacesService(map);
  autocomplete.addListener("place_changed", onPlaceChanged);

  // Add a DOM event listener to react when the user selects a country.
  document
    .getElementById("district")
    .addEventListener("change", setAutocompleteDistrict);
}

// When the user selects a District, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    if (marker != undefined) {
      marker.setMap(null);
    }
    var markerPos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      placeID: place.place_id,
      placeName: place.name
    };
    selectedLocation = markerPos;
    map.panTo(place.geometry.location);
    map.setZoom(15);
    marker = new google.maps.Marker({ position: markerPos, map: map });
  } else {
    document.getElementById("autocomplete").placeholder = "Enter a city";
  }
}

// center and zoom the map on the given District.
function setAutocompleteDistrict() {
  var country = document.getElementById("district").value;
  if (country != "0") {
    map.setCenter(districts[country].center);
    map.setZoom(districts[country].zoom);
  } else {
    map.setCenter({ lat: 7.8774, lng: 80.7003 });
    map.setZoom(7);
  }
}
