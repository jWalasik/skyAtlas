import { range, vertex , pairs } from '../helperfunctions.js'
import * as THREE from '../lib/three.module.js'

// See https://github.com/d3/d3-geo/issues/95
const Graticule = () => {
  function wireframe(multilinestring, material) {
    var geometry = new THREE.Geometry;
    multilinestring.coordinates.forEach(function(line) {
      pairs(
        line.map(vertex), 
        function(a, b) {
          geometry.vertices.push(a, b);
        }
      );
    });
  
    const graticule = new THREE.LineSegments(geometry, material);
    graticule.name = 'graticule'
    return graticule
  }

  function graticule10() {
    var epsilon = 1e-6,
        x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
        X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
        x = graticuleX(y0, y1, 1.5), y = graticuleY(x0, x1, 1.5),
        X = graticuleX(Y0, Y1, 1.5), Y = graticuleY(X0, X1, 1.5);
  
    function graticuleX(y0, y1, dy) {
      var y = range(y0, y1 - epsilon, dy).concat(y1);
      return function(x) { return y.map(function(y) { return [x, y]; }); };
    }
  
    function graticuleY(x0, x1, dx) {
      var x = range(x0, x1 - epsilon, dx).concat(x1);
      return function(y) { return x.map(function(x) { return [x, y]; }); };
    }
  
    return {
      type: "MultiLineString",
      coordinates: range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
          .concat(range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
          .concat(range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return Math.abs(x % DX) > epsilon; }).map(x))
          .concat(range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) { return Math.abs(y % DY) > epsilon; }).map(y))
    };
  }

  return wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0x383838}))
}

export default Graticule