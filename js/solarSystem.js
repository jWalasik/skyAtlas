/*
Orbital elements taken from NASA Jet Propulsion Laboratory: https://ssd.jpl.nasa.gov/txt/p_elem_t1.txt
  a: mean distance in AU (astronomic unit - distance from earth to sun)
  e: eccentricity of orbit in radians
  i: inclination in degrees
  L: mean longitude at date of elements (1 january 2000) in degrees
  n: daily motion in degrees/day
  o: longitude of ascending node at date of elements, degrees
  p: longitude of perihelion at date of elements, degrees
*/
const orbitals = {
  'mercury': (cy)=>{
    return {
      a: 0.38709893 + 0.00000066*cy,
      e: 0.20563069 + 0.00002527*cy,
      i: ( 7.00487  -  23.51*cy/3600)*RADS,
      o: (48.33167  - 446.30*cy/3600)*RADS,
      w: (77.45645  + 573.57*cy/3600)*RADS,
      L: ((252.25084 + 538101628.29*cy/3600)*RADS)
    }  
  },
  'venus': (cy)=>{
    return {   
      a: 0.72333199 + 0.00000092*cy,
      e: 0.00677323 - 0.00004938*cy,
      i: (  3.39471 -   2.86*cy/3600)*RADS,
      o: ( 76.68069 - 996.89*cy/3600)*RADS,
      w: (131.53298 - 108.80*cy/3600)*RADS,
      L: (181.97973 + 210664136.06*cy/3600)*RADS
    }
  },
  'earth': (cy)=>{
    return {
      a: 1.00000011 - 0.00000005*cy,
      e: 0.01671022 - 0.00003804*cy,
      i: (  0.00005 -    46.94*cy/3600)*RADS,
      o: (-11.26064 - 18228.25*cy/3600)*RADS,
      w: (102.94719 +  1198.28*cy/3600)*RADS,
      L: ((100.46435 + 129597740.63*cy/3600)*RADS)
    }
  },
  'mars': (cy)=>{
    return {
      a: 1.52366231 - 0.00007221*cy,
      e: 0.09341233 + 0.00011902*cy,
      i: (  1.85061 -   25.47*cy/3600)*RADS,
      o: ( 49.57854 - 1020.19*cy/3600)*RADS,
      w: (336.04084 + 1560.78*cy/3600)*RADS,
      L: ((355.45332 + 68905103.78*cy/3600)*RADS)
    }
  },
  'jupiter': (cy)=>{
    return {
      a: 5.20336301 + 0.00060737*cy,
      e: 0.04839266 - 0.00012880*cy,
      i: (  1.30530 -    4.15*cy/3600)*RADS,
      o: (100.55615 + 1217.17*cy/3600)*RADS,
      w: ( 14.75385 +  839.93*cy/3600)*RADS,
      L: ((34.40438 + 10925078.35*cy/3600)*RADS)
    }
  },
  'saturn': (cy)=>{
    return {
      a: 9.53707032 - 0.00301530*cy,
      e: 0.05415060 - 0.00036762*cy,
      i: (  2.48446 +    6.11*cy/3600)*RADS,
      o: (113.71504 - 1591.05*cy/3600)*RADS,
      w: ( 92.43194 - 1948.89*cy/3600)*RADS,
      L: ((49.94432 + 4401052.95*cy/3600)*RADS)
    }
  },
  'uranus': (cy)=>{
    return {
      a: 19.19126393 + 0.00152025*cy,
      e:  0.04716771 - 0.00019150*cy,
      i: (  0.76986  -    2.09*cy/3600)*RADS,
      o: ( 74.22988  - 1681.40*cy/3600)*RADS,
      w: (170.96424  + 1312.56*cy/3600)*RADS,
      L: ((313.23218 + 1542547.79*cy/3600)*RADS)
    }
  },
  'neptune': (cy)=>{
    return {
      a: 30.06896348 - 0.00125196*cy,
      e:  0.00858587 + 0.00002510*cy,
      i: (  1.76917  -   3.64*cy/3600)*RADS,
      o: (131.72169  - 151.25*cy/3600)*RADS,
      w: ( 44.97135  - 844.43*cy/3600)*RADS,
      L: ((304.88003 + 786449.21*cy/3600)*RADS)
    }
  },
  'pluto': (cy)=>{
    return {
      a: 39.48168677 - 0.00076912*cy,
      e:  0.24880766 + 0.00006465*cy,
      i: ( 17.14175  +  11.07*cy/3600)*RADS,
      o: (110.30347  -  37.33*cy/3600)*RADS,
      w: (224.06676  - 132.25*cy/3600)*RADS,
      L: ((238.92881 + 522747.90*cy/3600)*RADS)
    }
  }        
}
const RADS = Math.PI/180,
      DEGS = 180/Math.PI,
      HOURS = 24/360;
const floor = (x) => {
    let r;
    if (x >= 0.0) r = Math.floor(x);
    else r = Math.ceil(x);
    return r;
}
const mod2pi = (angle) => {
  var b = angle/(2*Math.PI);
    var a = (2*Math.PI)*(b - floor(b));  
    if (a < 0) a = (2*Math.PI) + a;
    return a;
}

class solarSystem {
  constructor(){
    this.bodies = {'mercury': {}, 'venus': {},'earth': {},'mars': {},'saturn': {},'uranus': {},'neptune': {},'pluto': {}}
  }

  getDaysJ2000(){
    const now = new Date()
    const year  = now.getUTCFullYear(),
          month = now.getUTCMonth() + 1,
          day   = now.getUTCDate(),
          hour  = now.getUTCHours(),
          mins  = now.getUTCMinutes(),
          secs  = now.getUTCSeconds()
    const h = hour + mins/60;
    const rv = 367*year 
           - Math.floor(7*(year + Math.floor((month + 9)/12))/4) 
           + Math.floor(275*month/9) + day - 730531.5 + h/24;
    
    return rv;
  }

  trueAnomaly(M, e){
    var V, E1;

    //approximation of eccentric anomaly
    var E = M + e*Math.sin(M)*(1.0 + e*Math.cos(M));

    // convert eccentric anomaly to true anomaly
    V = 2*Math.atan(Math.sqrt((1 + e)/(1 - e))*Math.tan(0.5*E));
    
    return V;
  }

  helioCoordinates(body){
    const {a,e,i,o,w,L} = body.elements
    const m = (L-w),
          v = this.trueAnomaly(m,e),
          r = a*(1-e**2)/(1+e*Math.cos(v))
    let x,y,z
    if(body.name==='earth'){
      x = r*Math.cos(v + w),
      y = r*Math.sin(v + w),
      z = 0.0
    } else {
      x = r*(Math.cos(o)*Math.cos(v + w - o) - Math.sin(o)*Math.sin(v + w - o)*Math.cos(i));
      y = r*(Math.sin(o)*Math.cos(v + w - o) + Math.cos(o)*Math.sin(v + w - o)*Math.cos(i));
      z = r*(Math.sin(v + w - o)*Math.sin(i));
    }
    this.bodies[body.name].heliocentricCoordinates = {
      x: x,
      y: y,
      z: z
    }
  }

  geoCoordinates(body){
    if(body.name === 'earth') return
    const {x:xe, y:ye, z:ze} = this.bodies.earth.heliocentricCoordinates

    const {x:xh, y:yh, z:zh} = body.heliocentricCoordinates
    //ecliptic coordinates shifted by earth position
    const X = xh-xe,
          Y = yh-ye,
          Z = zh-ze
    
    //convert coordinates to equatorial
    const tilt = 23.439281* RADS //earth axial tilt
    const Xeq = X,
          Yeq = Y*Math.cos(tilt) - Z*Math.sin(tilt),
          Zeq = Y*Math.sin(tilt) + Z*Math.cos(tilt)
    //compute RA and DEC
    this.bodies[body.name].RA = mod2pi(Math.atan2(Yeq, Xeq))*DEGS*HOURS
    this.bodies[body.name].DEC = Math.atan(Zeq/Math.sqrt(Xeq*Xeq + Yeq*Yeq))*DEGS;
    

    console.log(body.name)
    console.log('RA:',this.bodies[body.name].RA)
    console.log('DEC:',this.bodies[body.name].DEC)
  }

  init(){
    //calculate days since epoch j2000
    const days = this.getDaysJ2000()
    //compute orbital elements
    Object.keys(this.bodies).forEach(key => {
      this.bodies[key] = {
        name: key,
        elements: orbitals[key](days/36525)
      }
      //calculate heliocentrical coordinates for each object
      this.helioCoordinates(this.bodies[key])
    })
    //calculate geocentic coordinates
    Object.keys(this.bodies).forEach(key => {
      this.geoCoordinates(this.bodies[key])
    })
  }
}
//utils

let system = new solarSystem()
system.init()
