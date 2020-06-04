//hide the wrapper
$("#upload-wrapper").hide();

var user;
var database = firebase.database();
var localData = {};

//load world
database
  .ref("world/")
  .once("value")
  .then(function(snapshot) {
    localData = snapshot.val();
    $("#status").html("Status: Ready");
  });

$("#d").click(function() {
  var email = $("#h-email").val();
  var pwd = $("#h-pwd").val();
  console.log("s");
  firebase
    .auth()
    .signInWithEmailAndPassword(email, pwd)
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
});

//on firebase auth change
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    user = firebase.auth().currentUser;
    console.log("Logged in");
    //hide the must sign in div
    $("#con").hide();
    $("#content").show();
  } else {
    console.log("Not logged in");
    $("#con").show();
    $("#content").hide();

    user = firebase.auth().currentUser;
  }
});

//button functions
function searchByImgUrl() {
  var url = $("#imgURL").val();
  $("#status").html("Status: Running");
  Object.keys(localData).forEach(function(el) {
    localData[el]["images"].forEach(function(li) {
      if (li == url) {
        var str = "";
        str =
          `
        <br>Author: ` +
          localData[el]["author"] +
          `<br>
        push ID:` +
          el +
          ` <br>
        user ID : ` +
          localData[el]["uid"] +
          `<br>
        Image: <br><img width="200px" src="` +
          li +
          `">
          <br><br>
          <button onclick="deleteAndBan('` +
          el +
          `')">Delete and ban</button>
        `;
        $("#image-search-results").html(str);

        $("#status").html("Status: Ready");
      }
    });
  });
}

function deleteAndBan(id) {
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
    for (var i = 0; i < localData[id]["images"].length; i++) {
      var rx = new RegExp("%2..*%2F(.*?).alt=media"); //regex magix
      var fileName = rx.exec(localData[id]["images"][i])[1];
      console.log(fileName);
      var imageRef = firebase
        .storage()
        .ref("images/" + user.uid + "/" + fileName)
        .delete();
    }
  } else {
    console.log("Cancelled");
  }
}
