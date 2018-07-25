var tracjballControls, camera, lvl1Controls, lvl2Controls, lvl3Controls
function setupControls(){
  //default standard camera
  var lvl1Camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  lvl1Controls = new THREE.TrackballControls(lvl1Camera);
  lvl1Controls.rotateSpeed = 0.2;
  lvl1Controls.zoomSpeed = 1.0;
  lvl1Controls.panSpeed = 0.2;
  lvl1Controls.staticMoving = false;
  lvl1Controls.noPan=false;

  //camera centered at zenith
  var centeredCamera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  var centeredCameraControls = new THREE.TrackballControls(centeredCamera);

  //centered at constellation, single axis rotation, zoom enabled
  var lvl2Camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  var lvl2Controls = new THREE.TrackballControls(lvl2Camera);

  //centered at star, rotation and zoom enabled
  var lvl3Camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  var lvl3Controls = new THREE.TrackballControls(lvl3Camera);
}

function selectCam(){
  camera = window["lvl"+lvl+"Camera"];
  trackballControls = window["lvl"+lvl+"Controls"];
}
