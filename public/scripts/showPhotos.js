function showPhotos(ID) {
  imageContentString = "";
  for (var i = 0; i < locationData[ID]["images"].length; i++) {
    imageContentString +=
      `<bR>
        <a target="_blank" href="` +
      locationData[ID]["images"][i]["url"] +
      `"><img class="preview-img" src="` +
      locationData[ID]["images"][i]["url"] +
      `"><bR>
        <span class="author">Uploaded by ` +
      locationData[ID]["images"][i]["author"] +
      `</a></span><bR> `;
  }
  openNav(imageContentString);
}

function openNav(imageContentString) {
  $("#image-container").html(imageContentString);
  document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}
