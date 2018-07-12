var coords;
var test = 0;
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

  var now = new Date().getTime()/1000/60/60/24 //days,
      jd = (now-30*365.2425), //days since 2000 january 1
      ut = new Date().getHours();

    var lst = (100.46 + 0.985647 * jd + long + 15*(ut+test))%360; //d-number of days since j2000 epoch, long-longitude, ut - universal time
    test += 0;
    var zenith = vertex([-lat, -lst]);
    //console.log(lst);
    return zenith;
//6977.505643669164, y: -3537.6415427577203, z: 9099.423460171516 = Alkaid
    //camera.lookAt(zenith);
}

//translate geocoordinates to zeniths declination and right ascension
//var jd =  //julian date epoch
//var declination = position.coords.latitude;
//var sidereal = 0;

//
