function init(){
  var width = 960,
    height = 960,
    radius = 4000,
    minMag = 30,
    mesh,
    graticule,
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 15000),
    renderer = new THREE.WebGLRenderer({alpha: true});
    control = new THREE.TrackballControls(camera),
    clock = new THREE.Clock();
    camera.position.x = 100;
    camera.position.y = 100;
    camera.position.z = 300;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  var sprite = new THREE.TextureLoader( 'D:/Programowanie/projekty/three_project/textures/lensflare0.png' );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  //add graticule
  scene.add(graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0xaaaaaa})));

  //parse data
  //parse data
  queue()
    .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/433b888e3ed64da651f18d5c60682c8a/raw/76e8fa3fe6eb6aaf93154927788ecf6fd47e240c/hyg_data.csv", function (d){
      if (d.mag < minMag){return d;}
    })
    .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/66a84de978c8c787916cb363894a8da6b62bb915/bounds.json")
    .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9f2735f48f6f477064f9e151fe73cc7b0361bf2e/lines.json")
    .await(processData);

  function processData(error, hyg, bounds, lines){
    //process star data
    //translate color index to actuall color
    var starColor = d3.scale.linear()
                      .domain([-1, -0.17, 0.15, 0.44, 0.68, 1.15, 2])
                      .range(["#99d6ff", "#ccebff", "#ffffff", "#ffffcc", "#ffff99", "#ffb380", "#ff6666"]);
    var scaleMag = d3.scale.linear()
                      .domain([-1, 5])
                      .range([4, 1.5]);
    //define stars geometries, project them onto sphere
    var starsGeometry = new THREE.Geometry();
    hyg.map(function(d){
      var star = new THREE.Vector3();
      var lambda = d.ra*Math.PI/180*15,
          phi = d.dec*Math.PI/180,
          cosPhi = Math.cos(phi);
      star.x = radius*cosPhi*Math.cos(lambda);
      star.y = radius*cosPhi*Math.sin(lambda);
      star.z = radius * Math.sin(phi);

      starsGeometry.vertices.push(star);
      starsGeometry.colors.push(new THREE.Color(starColor(d.ci)));

    })
    THREE.ImageUtils.crossOrigin = '';
    var sprite = new THREE.TextureLoader( 'D:/Programowanie/projekty/three_project/textures/lensflare0.png' );
    console.log(starsGeometry);
    var starsMaterial = new THREE.PointsMaterial({size: 1, sizeAttenuation:true, vertexColors: THREE.VertexColors});
    var starField = new THREE.Points(starsGeometry, starsMaterial);
    //console.log(starField);
    scene.add(starField);
    var lensflare = new THREE.LensFlare(sprite, 1000, 0.0, THREE.AdditiveBlending);
    scene.add(lensflare);
    //process contellation boundaries

    bounds.boundaries.map(function(d){
      var boundsGeometry = new THREE.Geometry();
      d.shift();
      for(var i=0; i<d.length; i+=2){
        let point = new THREE.Vector3();
        var lambda = d[i]*Math.PI/180,
            phi = d[i+1]*Math.PI/180,
            cosPhi = Math.cos(phi);
        point.x = radius*cosPhi*Math.cos(lambda);
        point.y = radius*cosPhi*Math.sin(lambda);
        point.z = radius * Math.sin(phi);

        boundsGeometry.vertices.push(point);
      }

      var boundsMaterial = new THREE.LineBasicMaterial({color: 0xe8dd4e});
      var boundaries = new THREE.Line(boundsGeometry, boundsMaterial);
      scene.add(boundaries);

    });
    //process constellation lines
    lines.features.map(function(d){
      var linesGeometry = new THREE.Geometry();
      d.geometry.coordinates.map(function(d){
        d.map(function(d){
          let point = new THREE.Vector3();
          var lambda = d[0]*Math.PI/180,
              phi = d[1]*Math.PI/180,
              cosPhi = Math.cos(phi);
          point.x = radius*cosPhi*Math.cos(lambda);
          point.y = radius*cosPhi*Math.sin(lambda);
          point.z = radius * Math.sin(phi);

          linesGeometry.vertices.push(point);
        })

        var linesMaterial = new THREE.LineBasicMaterial({color: 0x8cb4ff});
        var lines = new THREE.Line(linesGeometry, linesMaterial);
        scene.add(lines);
        linesGeometry = new THREE.Geometry();
      })  //coordinates mapping end

    })  //lines.features.map end
  }
  //camera controls
  var trackballControls = new THREE.TrackballControls(camera);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.0;
  trackballControls.panSpeed = 1.0;
  trackballControls.staticMoving = false;

  trackballControls.noPan=true;


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

render();

function render(){
  var delta = clock.getDelta();
  trackballControls.update(delta);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
} //init end
window.onload = init;
