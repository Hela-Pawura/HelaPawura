var provider = new firebase.auth.FacebookAuthProvider();
var user;
var database = firebase.database();
var locationData = [];
var uniqueLocations = [];
var totalPhotos = 0;

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

$("#signout").click(function() {
  firebase.auth().signOut();
  $("#signout").hide();
});

//on firebase auth change
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    //hide the must sign in div
    $("#must-login-container").hide();
    $("#account-header").hide();
    user = firebase.auth().currentUser;
    loadAccountData();

    //show greeting and photo
    $("#avatar").attr("src", user.photoURL);
    $("#greeting").html("Ayubowan, " + user.displayName);

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
    $("#loading-spinner").hide();
    $("#details-wrapper").hide();
    $("#signout").hide();

    user = firebase.auth().currentUser;
  }
});

function loadAccountData() {
  //remove previous data
  totalPhotos = 0;
  uniqueLocations = [];
  $("#activity-body").html("");
  database
    .ref("world/")
    .orderByChild("uid")
    .equalTo(user.uid)
    .once("value")
    .then(
      function(snapshot) {
        locationData = snapshot.val();
        snapshot.forEach(function(plc) {
          //add to the number of total images
          totalPhotos += plc.val()["images"].length;

          //get the time
          formattedTime = timeConverter(plc.val()["timestamp"]);

          var placeID = plc.val()["placeID"];

          //save all the unique place IDs
          if (uniqueLocations.indexOf(placeID) == -1) {
            uniqueLocations.push(placeID);
          }

          $("#activity-body").prepend(
            `
            <div class="card border-secondary" style="max-width: 20rem;">
            <div class="card-header">
              ` +
              plc.val()["placeName"] +
              `
              <span
                class="badge del-btn badge-pill badge-danger"
                onClick="deleteEntry('` +
              plc.key +
              `')"
                >Delete</span
              >
            </div>
            <div class="card-body">
              <p class="card-text">
                District: ` +
              plc.val()["district"] +
              ` <br />
                Photos: ` +
              plc.val()["images"].length +
              `
                <br />
                Date: ` +
              formattedTime +
              ` <br />
              </p>
              <span class="badge badge-primary view-btn" onClick="viewEntry('` +
              plc.key +
              `')"
                >View</span
              >
            </div>
          </div><br>
            `
          );
        });
        //add the location stat
        $("#locations").html(uniqueLocations.length);

        if (totalPhotos == 0) {
          $("#activity-body").prepend(
            '<br><div class="text-center" view-btn>You havent contributed yet! Start contributing now!<br><br><a href="../upload.html"><button class="btn btn-danger">Contribute Now</buton></div>'
          );
        }
        //add the photos stat
        $("#ph").html(totalPhotos);

        //Show elements an dhide the spinner
        $("#loading-spinner").hide();
        $("#details-wrapper").show();
        $("#signout").show();
      },
      error => {
        console.log(error);
      }
    );
}

function deleteEntry(id) {
  var r = confirm("Are you sure you want to delete?");
  if (r == true) {
    p = database.ref("world/" + id);
    p.remove();
    database
      .ref("users/" + user.uid + "/contributions/")
      .orderByValue()
      .equalTo(id)
      .once("value")
      .then(function(snap) {
        snap.forEach(function(k) {
          database
            .ref("users/" + user.uid + "/contributions/" + k.key)
            .remove();
        });
      });

    //delete the fle from the storage
    // REGEX %2..*%2F(.*?)\?alt
    //get the file name
    for (var i = 0; i < locationData[id]["images"].length; i++) {
      var rx = new RegExp("%2..*%2F(.*?).alt=media"); //regex magix
      var fileName = rx.exec(locationData[id]["images"][i])[1];
      var imageRef = firebase
        .storage()
        .ref("images/" + user.uid + "/" + fileName)
        .delete();
    }
    loadAccountData();
  } else {
    console.log("Cancelled");
  }
}

function viewEntry(id) {
  imageContentString = "";
  for (var i = 0; i < locationData[id]["images"].length; i++) {
    imageContentString +=
      `<bR>
        <a target="_blank" href="` +
      locationData[id]["images"][i] +
      `"><img class="preview-img" src="` +
      locationData[id]["images"][i] +
      `"></a><bR>`;
    //delete + i eka damme no. eka ewnada balanna ah
  }
  openNav(imageContentString);
}

//function to convert the timestamp
function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}

//modal open
function openNav(imageContentString) {
  $("#image-container").html(imageContentString);
  document.getElementById("myNav").style.width = "100%";
}
//modal close
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}
