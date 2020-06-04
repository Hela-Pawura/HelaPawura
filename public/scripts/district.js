var database = firebase.database();

//get the district from the URL
var rx = new RegExp(".*#(.*)");
district = rx.exec(window.location.href)[1];

database
  .ref("world/")
  .orderByChild("district")
  .equalTo(district)
  .once("value", function(snap) {
    $("#district-heading").html(district);
    if (!snap.val()) {
      alert("Error");
    } else {
      snap.forEach(element => {
        for (var i = 0; i < element.val()["images"].length; i++) {
          $("#img-container").prepend(
            `
                    <img src="` +
              element.val()["images"][i] +
              `"/> <br>
                    <div class="text-muted">Uploaded by ` +
              element.val()["author"] +
              `<br> at ` +
              element.val()["placeName"] +
              ` </div>
                `
          );
        }
      });
    }
  });
