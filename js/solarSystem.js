const planets = {
  "sun":(d)=>{
    return {
      N : toRad(0.0),
			i : toRad(0.0),
			w : toRad(282.9404 + 4.70935E-5 * d),
			a : 1.000000,
			e : 0.016709 - 1.151E-9 * d,
      M : toRad(356.0470 + 0.9856002585 * d)
    }
  },
  "mars": (d)=>{
    return {
      N: toRad(49.5574 + 2.11081E-5 * d),
      i: toRad(1.8497 - 1.78E-8 * d),
      w: toRad(286.5016+2.92961E-5 * d),
      a: 1.523688,
      e: 0.093405 + 2.516E-9 * d,
      M: 1
    }
  }
}

const toRad = (deg) => deg * (Math.PI/180)
const toDeg = (rad) => rad * (180/Math.PI)

const calculateDay = () => {
  //j2000 is related to orbital elements used, 
  const now = new Date().getTime()/1000/60/60/24, //days since 1970 jan 1
        jd = (now-30*365.2422) //days since 2000 january 1 
  return jd
}


const planetPosition = (name, d) => {
  
  //http://www.stargazing.net/kepler/ellipse.html#twig02a
  
  //dummy data of mars
  const n=0.5240613,  //daily motion
        day=-60,        //days since/to j2000+
        L=262.42784,  //mean longitude +
        p=336.0882,    //perihelion longitude 
        e=0.0934231,   //eccentricity of orbit+
        a=1.5236365,
        o=49.5664,
        i=1.84992
  
  //calculate mean anomaly
  let M = n * day + L - p
  while(M<0 || M>360){
    M = M<0 ? M+360 : M-360
  }
  //calculate true anomaly, as a power series in the eccentricity and the sine of the mean anomaly                                   
  const v = M + 180/Math.PI * ((2*e - e**3 / 4) * Math.sin(toRad(M))
                               + 5/4 * e**2 * Math.sin(2*toRad(M))
                               + 13/12 * e**3 * Math.sin(3*toRad(M))
                              )
  //calculate planets radius vector
  const r = a * (1 - e**2) / (1 + e * Math.cos(toRad(v)))
  
  let angle = v+p-o
  while(angle>360 || angle<0){
    angle = angle<0 ? angle+360 : angle-360
  }
  //calculate heliocentric coordinates
  const x = r * (Math.cos(toRad(o)) * Math.cos(toRad(angle)) - Math.sin(toRad(o)) * Math.sin(toRad(angle)) * Math.cos(toRad(i))),
        y = r * (Math.sin(toRad(o)) * Math.cos(toRad(angle)) + Math.cos(toRad(o)) * Math.sin(toRad(angle)) *
    Math.cos(toRad(i))),
        z = r * (Math.sin(toRad(angle)) * Math.sin(toRad(i)))
  
  //calculate geocentric coordinates
  //dummy earth coords
  const xe = -0.00515816,
        ye = -1.01625196,
        ze =  0
        
  const X = x-xe,
        Y = y-ye,
        Z = z
  
  const ec = toRad(23.439292) //obliquity of ecliptic
  const Xq = X,
        Yq = Y * Math.cos(ec) - Z*Math.sin(ec),
        Zq = Y * Math.sin(ec) + Z*Math.cos(ec)
  
  //translate coordinates to right ascension declination
  const ra = (toDeg(Math.atan(Yq/Xq)) + 180) / 15,
        dec = toDeg(Math.atan(Zq/Math.sqrt(Xq**2 + Yq**2)))
  
  return [ra,dec]
}

const jd = calculateDay()

const mars = planetPosition('mars', jd)