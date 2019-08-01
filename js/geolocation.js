var coords;
var test = 0;

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(p){
      realtime = true;
      coords = p.coords;
      var skyCenter = new THREE.Vector3(0,12000,0);
      setTimeout(function(){
        //center sky vertically
        scene.getObjectByName("galaxy").quaternion.setFromUnitVectors(computeZenith().normalize(), skyCenter.clone().normalize());
      }, 5000);
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
      ut = new Date().getUTCHours() + new Date().getUTCMinutes()/100;

    var lst = (100.4606184 + 0.9856473662862 * jd + long + 15 * ut+test)%360; //d-number of days since j2000 epoch, long-longitude, ut - universal time
    var zenith = vertex([lst, lat]); //translate

    scene.getObjectByName("zenith").position.x = zenith.x;
    scene.getObjectByName("zenith").position.y = zenith.y;
    scene.getObjectByName("zenith").position.z = zenith.z-1000;

    return zenith;
}

function computeAzimuth(e){
  let azimuth = 360 - e.alpha
  trackballControls.updateAlphaOffsetAngle(THREE.Math.degToRad(azimuth))
}
