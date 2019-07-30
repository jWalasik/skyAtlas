var coords;
var test = 0;

//console.log(scene);
//get lat/long coordinates
function getLocation() {
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(p){
          realtime = true;
          coords = p.coords;
          var skyCenter = new THREE.Vector3(0,12000,0);
          setTimeout(function(){
            //center sky vertically
            scene.getObjectByName("galaxy").quaternion.setFromUnitVectors( computeZenith().normalize(), skyCenter.clone().normalize() );

            //center sky horizontally
            if(typeof window.orientation !== 'undefined'){

              var north = new THREE.Euler(0, window.orientation.webkitCompassHeading, 0, 'XYZ')
              scene.getObjectByName("galaxy").quaternion.setFromEuler(north, skyCenter.clone().normalize());
            }
            
            //MOCK HORIZONTAL ROTATION FOR DESKTOP DEBUG
            //var north = new THREE.Euler(1, 1, 1, 'XYZ')
            //scene.getObjectByName("galaxy").quaternion.setFromEuler(north, skyCenter.clone().normalize());
          }, 3000);


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
    //camera.lookAt(zenith);
}


