//translate color index to actuall color
var starColor = d3.scale.linear()
                  .domain([-1, 0.5, 0.73, 1.05, 1.25, 1.60, 2])
                  .range(['#68b1ff', '#93e4ff', '#d8f5ff', '#FFFFFF', '#fffad8', '#ffdda8', '#ffb5b5']);
//inverse size scalling with magnitude
var scaleMag = d3.scale.linear()
                  .domain([-2.5, 20])
                  .range([3.5, 0.005]);

// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
function vertex(point) {
  //console.log("point", point);
  var lambda = point[0] * Math.PI / 180,
      phi = point[1] * Math.PI / 180,
      cosPhi = Math.cos(phi);
  return new THREE.Vector3(
      radius * cosPhi * Math.cos(lambda),
      radius * cosPhi * Math.sin(lambda),
      radius * Math.sin(phi)
  );
}

function findLabelPos(coordArray){

  var min = Math.min(...coordArray),
      max = Math.max(...coordArray),
      mid = min + (max-min)/2;

  return mid;
}

// Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
function wireframe(multilinestring, material) {
  var geometry = new THREE.Geometry;
    multilinestring.coordinates.forEach(function(line) {
    d3.pairs(line.map(vertex), function(a, b) {
      geometry.vertices.push(a, b);
    });
  });
  return new THREE.LineSegments(geometry, material);
}

// See https://github.com/d3/d3-geo/issues/95
function graticule10() {
  var epsilon = 1e-6,
      x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
      X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
      x = graticuleX(y0, y1, 1.5), y = graticuleY(x0, x1, 1.5),
      X = graticuleX(Y0, Y1, 1.5), Y = graticuleY(X0, X1, 1.5);

  function graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
    return function(x) { return y.map(function(y) { return [x, y]; }); };
  }

  function graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
    return function(y) { return x.map(function(x) { return [x, y]; }); };
  }

  return {
    type: "MultiLineString",
    coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
        .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
        .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return Math.abs(x % DX) > epsilon; }).map(x))
        .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) { return Math.abs(y % DY) > epsilon; }).map(y))
  };
}

const fitCameraToObject = function ( camera, object, offset, controls ) {

	offset = offset || 1.25;

	const boundingBox = new THREE.Box3();

	// get bounding box of object - this will be used to setup controls and camera
	boundingBox.setFromObject( object );

	const center = boundingBox.getCenter();

	const size = boundingBox.getSize();

	// get the max side of the bounding box (fits to width OR height as needed )
	const maxDim = Math.max( size.x, size.y, size.z );
	const fov = camera.fov * ( Math.PI / 180 );
	let cameraZ = Math.abs( maxDim / 2 * Math.tan( fov * 2 ) ); //Applied fifonik correction

	cameraZ *= offset; // zoom out a little so that objects don't fill the screen

	// <--- NEW CODE
	//Method 1 to get object's world position
	scene.updateMatrixWorld(); //Update world positions
	var objectWorldPosition = new THREE.Vector3();
	objectWorldPosition.setFromMatrixPosition( object.matrixWorld );

	//Method 2 to get object's world position
	//objectWorldPosition = object.getWorldPosition();

	const directionVector = camera.position.sub(objectWorldPosition); 	//Get vector from camera to object
	const unitDirectionVector = directionVector.normalize(); // Convert to unit vector
	camera.position = unitDirectionVector.multiplyScalar(cameraZ); //Multiply unit vector times cameraZ distance
	camera.lookAt(objectWorldPosition); //Look at object
	// --->

	const minZ = boundingBox.min.z;
	const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

	camera.far = cameraToFarEdge * 3;
	camera.updateProjectionMatrix();

	if ( controls ) {

	  // set camera to rotate around center of loaded object
	  controls.target = center;

	  // prevent camera from zooming out far enough to create far plane cutoff
	  controls.maxDistance = cameraToFarEdge * 2;

	  controls.saveState();

	} else {

		camera.lookAt( center )

   }
}

function scrolling(direction){
  switch(direction){
    case 'down':
      window.scrollBy(0, window.innerHeight);
      updateUI("description");
      break;
    case 'up':
      window.scrollTo(0,0);
      updateUI("atlas");
      break;
  }
}
function updateUI(state){
  var downBtn = document.getElementById('scroll-down'),
      returnBtn = document.getElementById('return'),
      cont = document.getElementById('scroll-container');

  switch(state){
    case "default":
      downBtn.style.display = 'none';
      returnBtn.style.display = 'none';
      cont.style.display = 'none';
      break;
    case "atlas":
      downBtn.style.display = 'inline-block';
      returnBtn.style.display = 'block';
      cont.style.display = 'none';
      break;
    case "description":
      downBtn.style.display = 'none';
      returnBtn.style.display = 'none';
      cont.style.display = 'block';
      break;
    case "offset":
      if(window.pageYOffset > window.innerHeight) cont.classList.add('sticky');
      if(window.pageYOffset <= window.innerHeight) cont.classList.remove('sticky');
      if(window.pageYOffset == 0) updateUI('atlas');
      if(window.pageYOffset > 10) updateUI('description');
  }
}

function posFix(){
	var scrollCon = document.getElementById('scroll-container');
	var sticky = window.innerHeight;

	if(window.pageYOffset >= sticky){
    document.getElementById('scroll-down').classList.add('hidden');
		scrollCon.classList.add('sticky');
	} else {
		//scrollCon.style.display = 'none';
		scrollCon.classList.remove('sticky');
	}
}

function switchControls(){
  var prevCamera = camera;
  console.log(camera.rotation);
  camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);

  var MODE = {TRACKBALL: 0, ORIENTATION: 1};

  switch(mode){
    case MODE.TRACKBALL:
      camera.position.copy( prevCamera.position );
      camera.rotation.copy( prevCamera.rotation );
      trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
      mode = MODE.ORIENTATION;
      break;

    case MODE.ORIENTATION:
      camera.position.set(0,0,0);
      trackballControls = new THREE.DeviceOrientationControls(camera);
      mode = MODE.TRACKBALL;
      break;
  }
  console.log(mode)
}
