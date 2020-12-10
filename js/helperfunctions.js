import * as THREE from './lib/three.module.js'

// //translate color index to actuall color
// var starColor = d3.scale.linear()
//                   .domain([-1, 0.5, 0.73, 1.05, 1.25, 1.60, 2])
//                   .range(['#68b1ff', '#93e4ff', '#d8f5ff', '#FFFFFF', '#fffad8', '#ffdda8', '#ffb5b5']);
// //inverse size scalling with magnitude
// // var scaleMag = d3.scale.log()
// //                   .domain([-2.5, 20])
// //                   .range([3.5, 0.05]);
// var scaleMag = (mag) => {
//   //since using logarithmic scale inversed and account for negative values
//   return Math.log((mag-20)*-1)
// }
export function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
export function vertex(point) {
  const radius = 12000
  var lambda = point[0] * Math.PI / 180,
      phi = point[1] * Math.PI / 180,
      cosPhi = Math.cos(phi);
  return new THREE.Vector3(
      radius * cosPhi * Math.cos(lambda),
      radius * cosPhi * Math.sin(lambda),
      radius * Math.sin(phi)
  );
}

// function findLabelPos(coordArray){

//   var min = Math.min(...coordArray),
//       max = Math.max(...coordArray),
//       mid = min + (max-min)/2;

//   return mid;
// }


export function pairs(values, pairof = pair) {
  const pairs = [];
  let previous;
  let first = false;
  for (const value of values) {
    if (first) pairs.push(pairof(previous, value));
    previous = value;
    first = true;
  }
  return pairs;
}

export function pair(a, b) {
  return [a, b];
}

// function scrolling(direction){
//   switch(direction){
//     case 'down':
//       window.scrollBy(0, window.innerHeight);
//       updateUI("description");
//       break;
//     case 'up':
//       window.scrollTo(0,0);
//       updateUI("atlas");
//       break;
//   }
// }
// function updateUI(state){
//   var downBtn = document.getElementById('scroll-down'),
//       returnBtn = document.getElementById('return'),
//       cont = document.getElementById('scroll-container');

//   switch(state){
//     case "default":
//       downBtn.style.display = 'none';
//       returnBtn.style.display = 'none';
//       cont.style.display = 'none';
//       break;
//     case "atlas":
//       downBtn.style.display = 'inline-block';
//       returnBtn.style.display = 'block';
//       cont.style.display = 'none';
//       break;
//     case "description":
//       downBtn.style.display = 'none';
//       returnBtn.style.display = 'none';
//       cont.style.display = 'block';
//       break;
//     case "offset":
//       if(window.pageYOffset > window.innerHeight) cont.classList.add('sticky');
//       if(window.pageYOffset <= window.innerHeight) cont.classList.remove('sticky');
//       if(window.pageYOffset == 0) updateUI('atlas');
//       if(window.pageYOffset > 10) updateUI('description');
//   }
// }

// function posFix(){
// 	var scrollCon = document.getElementById('scroll-container');
// 	var sticky = window.innerHeight;

// 	if(window.pageYOffset >= sticky){
//     document.getElementById('scroll-down').classList.add('hidden');
// 		scrollCon.classList.add('sticky');
// 	} else {
// 		//scrollCon.style.display = 'none';
// 		scrollCon.classList.remove('sticky');
// 	}
// }

// function switchControls(){
//   var prevCamera = camera;
//   camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);

//   var MODE = {TRACKBALL: 0, ORIENTATION: 1};

//   camera.quaternion.copy( prevCamera.quaternion );
//   camera.quaternion.copy( prevCamera.quaternion );

//   switch(mode){
//     case MODE.TRACKBALL:
//       trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
//       mode = MODE.ORIENTATION;
//       break;

//     case MODE.ORIENTATION:
//       trackballControls = new THREE.DeviceOrientationControls(camera);
//       mode = MODE.TRACKBALL;
//       break;
//   }
// }
