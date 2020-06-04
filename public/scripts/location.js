var database = firebase.database();

//get the district from the URL
var rx = new RegExp(".*#(.*)");
loc = rx.exec(window.location.href)[1];

database
  .ref("world/")
  .orderByChild("placeID")
  .equalTo(loc)
  .once("value", function(snap) {
    if (!snap.val()) {
      alert("Error");
    } else {
      snap.forEach(element => {
        $("#district-heading").html(element.val()["placeName"]);
        for (var i = 0; i < element.val()["images"].length; i++) {
          $("#img-container").prepend(
            `
                    <img src="` +
              element.val()["images"][i] +
              `"/> <br>
                    <div class="text-muted">Uploaded by ` +
              element.val()["author"] +
              ` </div>
                `
          );
        }
      });
    }
  });
