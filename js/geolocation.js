//get lat/long coordinates
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    console.log(position.coords.latitude, position.coords.longitude);
}

//translate geocoordinates to zeniths declination and right ascension
//var declination = position.coords.latitude;
//var sidereal = 0;
//var lst = 0;//Local Sidereal Time
