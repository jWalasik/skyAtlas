import * as THREE from './lib/three.module.js'

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max)
}

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
//true logarithmic scaling doesnt seem to work well, settled with non scientific version
export function scaleMag(mag) {
  const percent = (val, min, max) => {
    const invert = max - val
    return (invert - min) / (max - min)
  }

  //walasik constants aka stupid scale
  let size
  if(mag>6) { //naked eye visibility
    size = percent(mag, 6, 20) * (2.0 - 1.0) + 0.7
  } else if(mag<3.5) {  //most named stars
    size = percent(mag, -5, 3.5) * (8.0 - 5.0) + 5.2
  } else size = percent(mag, 3.0, 6) * (2.2 - 1.6) + 3.0
  return size
}

export function hexToRgb(hex) {
  var result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
//heavy approximations
export function starColor(ci,type) {
  //http://www.vendian.org/mncharity/dir3/starcolor/details.html
  const ciTemp = ['0x9bb2ff','0x9eb5ff','0xa3b9ff','0xaabfff','0xb2c5ff','0xbbccff','0xc4d2ff','0xccd8ff','0xd3ddff','0xdae2ff','0xdfe5ff','0xe4e9ff','0xe9ecff','0xeeefff','0xf3f2ff','0xf8f6ff','0xfef9ff','0xfff9fb','0xfff7f5','0xfff5ef','0xfff3ea','0xfff1e5','0xffefe0','0xffeddb','0xffebd6','0xffe9d2','0xffe8ce','0xffe6ca','0xffe5c6','0xffe3c3','0xffe2bf','0xffe0bb','0xffdfb8','0xffddb4','0xffdbb0','0xffdaad','0xffd8a9','0xffd6a5','0xffd5a1','0xffd29c','0xffd096','0xffcc8f','0xffc885','0xffc178','0xffb765','0xffa94b','0xff9523','0xff7b00','0xff5200']
  
  if(!ci) {
    return hexToRgb('0xdfe5ff')
  }
  const min = -0.4, max = 2.0
  for(let i=0; i<ciTemp.length; i++) {
    if(ci <= min + i*0.05) {
      return hexToRgb(ciTemp[i])
    }
  }
  return hexToRgb('0xff5200')
}

export function toJSON(csv) {
  let lines = [];
const linesArray = csv.split('\n');
// for trimming and deleting extra space 
linesArray.forEach((e) => {
    const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
    lines.push(row);
});
// for removing empty record
lines.splice(lines.length - 1, 1);
const result = [];
const headers = lines[0].split(",");

for (let i = 1; i < lines.length; i++) {

    const obj = {};
    const currentline = lines[i].split(",");

    for (let j = 0; j < headers.length; j++) {
    obj[headers[j]] = currentline[j];
    }
    result.push(obj);
}
//return result; //JavaScript object
// return JSON.stringify(result); //JSON
return result;
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

export function celestialToCartesian(ra, dec, dist) {
  const x = ((dist * Math.cos(dec)) * Math.cos(ra)),
        y = ((dist * Math.cos(dec)) * Math.sin(ra)),
        z = dist * Math.sin(dec);

  return new THREE.Vector3().set(x,y,z)
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
