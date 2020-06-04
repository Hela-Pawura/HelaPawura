var i = 0;
var p = 0;
var lastKey = "";
var loaderBusy = false;
var displayedIDs = [];
database
  .ref("world/")
  //.limitToLast(6)
  .once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(plc) {
      displayedIDs.push(plc.key);
      if (p == 0) {
        lastKey = plc.key;
      }
      p++;

      plc.val()["images"].forEach(function(image) {
        var col;
        col = i % 4;

        if (i > 0) {
          $("#c" + col).prepend(
            `
                    <img src="` +
              image +
              `" class="grid-img" onclick='show(this,
                        "` +
              plc.val()["author"] +
              `","` +
              plc.val()["placeName"] +
              `")'>
                     `
          );
        }
        i += 1;
      });
    });
    $("#loading-spinner").hide();
  });

//scroll position
$(window).scroll(function() {
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    if (!loaderBusy) {
      loaderBusy = true;
      //loadMore(); TEMP TEMPORARILY DISABLED
    }
  }
});

//function to load more photos
function loadMore() {
  database
    .ref("world/")
    .orderByKey()
    .limitToLast(6)
    .endAt(lastKey)
    .once("value")
    .then(function(snapshot) {
      lastKey = Object.keys(snapshot.val())[0];
      snapshot.forEach(function(plc) {
        displayedIDs.push(plc.key);
        plc.val()["images"].forEach(function(image) {
          var col;
          col = i % 4;
          if (displayedIDs.indexOf(plc.key) == -1) {
            $("#c" + col).append(
              `
                    <img src="` +
                image +
                `" class="grid-img" onclick='show(this,
                        "` +
                plc.val()["author"] +
                `","` +
                plc.val()["placeName"] +
                `")'>
                `
            );
          }
          i += 1;
        });
      });
      window.setTimeout(function() {
        loaderBusy = false;
      }, 2000);
    });
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

//runs when user clicks an image
function show(t, name, loc) {
  modal.style.display = "block";
  modalImg.src = t.src;
  captionText.innerHTML = "Uploaded by " + name + " at " + loc;
}
