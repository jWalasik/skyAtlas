import * as THREE from './lib/three.module.js'

export function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

export function scaleMag(mag) {
  //inverted logarithmic scale, account for negative values
  return Math.log((mag-20)*-1)
}

export function starColor(ci,type) {
  const t = 4600 * ((1 / ((0.92 * ci) + 1.7)) +(1 / ((0.92 * ci) + 0.62)) )

  var x, y = 0

  if (t >= 1667 & t <= 4000) {
    x = ((-0.2661239 * Math.pow(10,9)) / Math.pow(t,3)) + ((-0.2343580 * Math.pow(10,6)) / Math.pow(t,2)) + ((0.8776956 * Math.pow(10,3)) / t) + 0.179910
  } else if (t > 4000) {
    x = ((-3.0258469 * Math.pow(10,9)) / Math.pow(t,3)) + ((2.1070379 * Math.pow(10,6)) / Math.pow(t,2)) + ((0.2226347 * Math.pow(10,3)) / t) + 0.240390
  }

  if (t >= 1667 & t <= 2222) {
    y = -1.1063814 * Math.pow(x,3) - 1.34811020 * Math.pow(x,2) + 2.18555832 * x - 0.20219683
  } else if (t > 2222 & t <= 4000) {
    y = -0.9549476 * Math.pow(x,3) - 1.37418593 * Math.pow(x,2) + 2.09137015 * x - 0.16748867
  } else if (t > 4000) {
    y = 3.0817580 * Math.pow(x,3) - 5.87338670 * Math.pow(x,2) + 3.75112997 * x - 0.37001483
  }

  var Y = 1.0
  var X = (y == 0)? 0 : (x * Y) / y
  var Z = (y == 0)? 0 : ((1 - x - y) * Y) / y
  var r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
  var g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
  var b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z
  var R = (r <= 0.0031308)? 12.92*r : 1.055*Math.pow(r,1/0.5)-0.055
  var G = (g <= 0.0031308)? 12.92*g : 1.055*Math.pow(g,1/0.5)-0.055
  var B = (b <= 0.0031308)? 12.92*b : 1.055*Math.pow(b,1/0.5)-0.055

  return [
    Math.round(R*255),
    Math.round(G*255),
    Math.round(B*255)
  ]
}

export function toJSON(csv) {
  let lines=csv.split("\n");
  let result = [];
  let headers=lines[0].split(",");

  for(let i=1;i<lines.length;i++){
      let obj = {};
      let currentline=lines[i].split(",");

      for(let j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
  }
  return result
}

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
export function vertex([a,b]) {
  const radius = 12000
  var lambda = a * Math.PI / 180,
      phi = b * Math.PI / 180,
      cosPhi = Math.cos(phi);
  return new THREE.Vector3(
      radius * cosPhi * Math.cos(lambda),
      radius * cosPhi * Math.sin(lambda),
      radius * Math.sin(phi)
  );
}

export function vertex2D(x,y,z, camera, width, height) {
  const p = new THREE.Vector3(x,y,z)
  const vector = p.project(camera.clone())

  vector.x = (vector.x + 1) / 2 * width
  vector.y = -(vector.y - 1) / 2 * height

  return vector
}

export function computeZenith(lat, lon) {
  let test = 0
  const now = new Date().getTime()/1000/60/60/24 //days,
  const jd = now - 30*365.2425 //days since 2000 january 1 - julian day
  const ut = new Date().getUTCHours() + new Date().getUTCMinutes() / 100

  const lst = (100.4606184 + 0.9856473662862 * jd + lon + 15 * ut+test) % 360 //d-number of days since j2000 epoch, long-longitude, ut - universal time
  const zenith = vertex([lst, lat])

  return zenith;
}

export function compassHeading(alpha, beta, gamma) {
  // Convert degrees to radians
  const alphaRad = alpha * (Math.PI / 180);
  const betaRad = beta * (Math.PI / 180);
  const gammaRad = gamma * (Math.PI / 180);

  // Calculate equation components
  const cA = Math.cos(alphaRad);
  const sA = Math.sin(alphaRad);
  const cB = Math.cos(betaRad);
  const sB = Math.sin(betaRad);
  const cG = Math.cos(gammaRad);
  const sG = Math.sin(gammaRad);

  // Calculate A, B, C rotation components
  const rA = - cA * sG - sA * sB * cG;
  const rB = - sA * sG + cA * sB * cG;
  const rC = - cB * cG;

  // Calculate compass heading
  let compassHeading = Math.atan(rA / rB);

  // Convert from half unit circle to whole unit circle
  if(rB < 0) {
      compassHeading += Math.PI;
  }else if(rA < 0) {
      compassHeading += 2 * Math.PI;
  }

  // Convert radians to degrees
  compassHeading *= 180 / Math.PI;
  return compassHeading;
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
