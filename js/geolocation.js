var coords;
//get lat/long coordinates
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(p){
          realtime = true;
          coords = p.coords;
        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function computeZenith() {
  var lat = coords.latitude,
      long = coords.longitude;

  var now = new Date().getTime(),
//1531332820260
//584624260260
      jd = (now-30*365.2425*24*60*60*1000)/1000/60/60/24,
      ut = new Date().getHours();

    var lst = 100.46 + 0.985647 * jd + long + 15 * ut; //d-number of days since j2000 epoch, long-longitude, ut - universal time
    camera.lookAt(1566.0144637680896, 8187.788531389899, 8631.785311539508);
    var zenith = vertex([lat, lst/60]);
    camera.lookAt(zenith);
}

//translate geocoordinates to zeniths declination and right ascension
//var jd =  //julian date epoch
//var declination = position.coords.latitude;
//var sidereal = 0;

//
