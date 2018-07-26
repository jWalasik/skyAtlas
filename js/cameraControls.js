var lvl1Controls, lvl2Controls, lvl3Controls, lvl2Camera, lvl3Camera, lvl1Camera;
function setupCameras(renderer){
  //default standard camera
  lvl1Camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  lvl1Camera.position.set(0,0,1)
  lvl1Controls = new THREE.TrackballControls(lvl1Camera);
  lvl1Controls.rotateSpeed = 0.2;
  lvl1Controls.zoomSpeed = 1.0;
  lvl1Controls.panSpeed = 0.2;
  lvl1Controls.staticMoving = false;
  lvl1Controls.noPan=false;
  lvl1Controls.name

  //camera centered at zenith
  centeredCamera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  var centeredCameraControls = new THREE.TrackballControls(centeredCamera);

  //centered at constellation, single axis rotation, zoom enabled
  lvl2Camera = new THREE.PerspectiveCamera(20, width/30 / (height/30), 1, 100000);
  lvl2Controls = new THREE.TrackballControls(lvl2Camera);
  lvl2Controls.rotateSpeed = 0.2;
  lvl2Controls.zoomSpeed = 1.0;
  lvl2Controls.panSpeed = 0.2;
  lvl2Controls.staticMoving = false;
  lvl2Controls.noPan=true;

  //centered at star, rotation and zoom enabled
  lvl3Camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  lvl3Controls = new THREE.TrackballControls(lvl3Camera);
}

function selectCam(){
  camera = window["lvl"+lvl+"Camera"];
  trackballControls = window["lvl"+lvl+"Controls"];
  console.log(trackballControls)
}
