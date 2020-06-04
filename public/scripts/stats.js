function genStats(data, uniqueLocations, raw) {
  //YES TOO MANY ITERATIVE SHIT> ANDYES I KNOW ITS COMPUTATIONALLY INTENSIVE> I HAVE NO CHOICE
  /************************** PAWURA SAMPLE ****************************** */
  //create a list of all URLS
  var imageUrlList = [];
  var imageLocaionList = [];
  raw.forEach(function(el) {
    imageUrlList = imageUrlList.concat(el.val()["images"]);
    temp = el.val()["images"];
    temp.forEach(function(temp_) {
      imageLocaionList.push(el.val()["placeName"]);
    });
  });
  console.log(imageLocaionList);
  var col = 0;
  for (var i = 0; i < 10; i++) {
    col = i % 3;
    rand = Math.floor(Math.random() * Math.floor(imageLocaionList.length)); //create a temp random int
    $("#c" + col).append(
      `<img src="` +
        imageUrlList[rand] +
        `" class="grid-img" onclick="showPawuraImage('` +
        imageUrlList[rand] +
        `','` +
        imageLocaionList[rand] +
        `')"> `
    );
  }

  /************************** POPULAR DISTRICTS ****************************** */
  var districtCount = {};
  var sortedDistricts = [];
  var sortedDistrictsCount = [];
  var pluralSingle = "photos";
  //iterate over the uniq loc object to calculate stats
  for (let key in uniqueLocations) {
    //gen popular districts
    if (!districtCount[uniqueLocations[key]["district"]]) {
      districtCount[uniqueLocations[key]["district"]] = 0;
      districtCount[uniqueLocations[key]["district"]] += 1;
    } else {
      districtCount[uniqueLocations[key]["district"]] += 1;
    }
  }
  //district shit
  c = Object.keys(districtCount).length;

  //sort the top district names
  for (var i = 0; i < c; i++) {
    sortedDistricts[i] = Object.keys(districtCount).reduce((a, b) =>
      districtCount[a] > districtCount[b] ? a : b
    );
    sortedDistrictsCount[i] = districtCount[sortedDistricts[i]];
    delete districtCount[sortedDistricts[i]];
  }

  //add district things to the container div
  $("#popular-district-container").html("");
  for (var i = 0; i < sortedDistricts.length; i++) {
    if (sortedDistrictsCount[i] > 1) {
      pluralSingle = " Locations";
    } else {
      pluralSingle = " Location";
    }
    $("#popular-district-container").append(
      `
		<div class="district-card text-center">
        <div class="container">
          <div class="row">
            <div class="col-sm c">
              <h4>
                ` +
        sortedDistricts[i] +
        `
              </h4>
            </div>
            <div class="col-sm c">
              ` +
        sortedDistrictsCount[i] +
        pluralSingle +
        `
            </div>
            <div class="col-sm c">
              <a href="/district.html#` +
        sortedDistricts[i] +
        `"><button class="btn btn-primary">View Photos</button></a>
            </div>
          </div>
        </div>
      </div>
		`
    );
  } // end of the for loop (generate the html string).

  /************************** POPULAR PLACES ****************************** */
  var placesCount = {};
  var sortedPlaces = [];
  var sortedPlacesCounts = [];

  //iterate over the uniq loc object to calculate stats
  for (let key in uniqueLocations) {
    //gen popular districts
    if (!placesCount[key]) {
      placesCount[key] = [];
      placesCount[key] = uniqueLocations[key]["images"].length;
    } else {
      placesCount[key] += uniqueLocations[key]["images"].length;
    }
  }

  //sort the top district names
  for (var i = 0; i < 10; i++) {
    sortedPlaces[i] = Object.keys(placesCount).reduce((a, b) =>
      placesCount[a] > placesCount[b] ? a : b
    );
    sortedPlacesCounts[i] = placesCount[sortedPlaces[i]];
    delete placesCount[sortedPlaces[i]];
  }

  //add top places things to the container div
  //TODO: increase i<5 to i<10
  //*** TODOO  */ replace sortedPlaces.length with 5 or 10

  $("#popular-places-container").html("");
  for (var i = 0; i < sortedPlaces.length; i++) {
    if (sortedPlacesCounts[i] > 1) {
      pluralSingle = " Photos";
    } else {
      pluralSingle = " Photo";
    }
    $("#popular-places-container").append(
      `
		<div class="district-card text-center">
        <div class="container">
          
            <div class=" c">
              <h4>
                ` +
        uniqueLocations[sortedPlaces[i]]["placeName"] +
        `
              </h4>
            </div>
            <div class=" c">
              ` +
        sortedPlacesCounts[i] +
        pluralSingle +
        `
            </div><br>
            <div class="c">
              <a href="location.html#` +
        sortedPlaces[i] +
        `"><button class="btn btn-primary">View Photos</button></a>
            </div>
         
        </div>
      </div>
		`
    );
    $("#footer").show();
  } // end of the for loop (generate the html string).

  /************************** TOP CONTRIBUTORS ****************************** */
  c = {}; //top contributor counts
  authorNames = {}; //maps uid to names
  raw.forEach(function(en) {
    if (c[en.val().uid] == undefined) {
      c[en.val().uid] = en.val()["images"].length;
      authorNames[en.val().uid] = en.val()["author"];
    } else {
      c[en.val().uid] = c[en.val().uid] + en.val().images.length;
    }
  });
  //sort that object by keys
  sortedContributorKeys = Object.keys(c).sort(function(a, b) {
    return c[a] - c[b];
  });
  for (var i = sortedContributorKeys.length - 1; i >= 0; i--) {
    if (c[sortedContributorKeys[i]] > 1) {
      pluralSingle = " Photos";
    } else {
      pluralSingle = " Photo";
    }

    $("#top-contributors-container").append(
      `
      <div class="district-card text-center" style="padding-top:10px; padding-bottom:10px;">
        <h4>
          ` +
        authorNames[sortedContributorKeys[i]] +
        ` 
        </h4>
        ` +
        c[sortedContributorKeys[i]] +
        pluralSingle +
        `
      </div>
    `
    );
  }
  //show top contributors in the div

  //hide the spinner and show data
  document.getElementById("loading-spinner").style.display = "none";
  document.getElementById("stats-container").style.display = "block";

  $("body").attr("class", "");
  $("#splash-container").fadeOut();
  $("#footer").show();
}

function showPawuraImage(url, location) {
  imageContentString = "";
  imageContentString =
    `<bR>
        <a target="_blank" href="` +
    url +
    `"><img class="preview-img" src="` +
    url +
    `"><bR>
        <span class="author">At ` +
    location +
    `</a></span><bR> `;

  openNav(imageContentString);
}
