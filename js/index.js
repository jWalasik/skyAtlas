//controls
var displayStars = true,
    displayConLabels = true,
    displayBoundLabels = true,
    minMag = 7.5,
    projector,
    mouse = {x: 0, y: 0},
    INTERSECTED;

function init(){
  //globals
  var width = window.innerWidth,
    height = window.innerHeight,
    radius = 8000,
    mesh,
    graticule,

  //standard three.js stuff
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 100000),
    renderer = new THREE.WebGLRenderer({alpha: true});
    control = new THREE.TrackballControls(camera),
    clock = new THREE.Clock(),
    marker = 0,
    mouse=new THREE.Vector3();
    camera.position.x = 2000;
    camera.position.y = 2000;
    camera.position.z = -5000;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  //add graticule
  scene.add(graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0xaaaaaa})));

  //parse data
  queue()
    .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/433b888e3ed64da651f18d5c60682c8a/raw/76e8fa3fe6eb6aaf93154927788ecf6fd47e240c/hyg_data.csv", function (d){
      if (d.mag < minMag){return d;}
    })
    .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/e564adc14380c69c0b9012c1363750dbef2411f1/bounds.json")
    .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9f2735f48f6f477064f9e151fe73cc7b0361bf2e/lines.json")
    .await(processData);

  function processData(error, hyg, bounds, lines){
    //process star data
    //translate color index to actuall color
    var starColor = d3.scale.linear()
                      .domain([-1, 0.5, 0.73, 1.05, 1.25, 1.60, 2])
                      .range(['#68b1ff', '#93e4ff', '#d8f5ff', '#FFFFFF', '#fff8c9', '#ffcf84', '#ff8787']);
    //inverse size scalling with magnitude
    var scaleMag = d3.scale.linear()
                      .domain([-2.5, 16])
                      .range([3.5, 0.01]);

    var label = function(position){

    }
    //define stars geometries, project them onto sphere
    var starsGeometry = new THREE.BufferGeometry();
    var vertices = [];
    var colors = [];
    var sizes = [];
    var uniforms = {
      color: { type: "c", value: new THREE.Color( 0xffffff ) },
    };

    //process contellation boundaries
    bounds.boundaries.map(function(d){
      var points = [];
      var boundsName = d.shift();
      var boundsGeometry = new THREE.Geometry();
      var outlineGeometry = new THREE.Geometry();
      var labelX = [];
      var labelY = [];
      var labelZ = [];
      //extract vertices from database
      for(var i=0; i<d.length; i+=2){
        let point = new THREE.Vector3();
        var lambda = d[i]*Math.PI/180,
            phi = d[i+1]*Math.PI/180,
            cosPhi = Math.cos(phi);
        point.x = radius*cosPhi*Math.cos(lambda);
        point.y = radius*cosPhi*Math.sin(lambda);
        point.z = radius * Math.sin(phi);

        boundsGeometry.vertices.push(point);
        outlineGeometry.vertices.push(point);
        //label coordinates
        labelX.push(point.x);
        labelY.push(point.y);
        labelZ.push(point.z);
      }
      //draw boundary outline
      var outlineMaterial = new THREE.LineBasicMaterial({color: 0xfbff3d});
      var outline = new THREE.Line(outlineGeometry, outlineMaterial);
      scene.add(outline);

      //triangulation method
      var triangles = THREE.ShapeUtils.triangulateShape(boundsGeometry.vertices, []);

      for(var i = 0; i < triangles.length; i++){
        boundsGeometry.faces.push(new THREE.Face3(triangles[i][0], triangles[i][2], triangles[i][1]));
      }

      var boundsMaterial = new THREE.MeshBasicMaterial({color: 0x96fff7, transparent:true, opacity:0.0});
      var boundsMesh = new THREE.Mesh(boundsGeometry, boundsMaterial);

      boundsMesh.material.side = THREE.DoubleSide;
      console.log(boundsMesh);
      scene.add(boundsMesh);

      //boundary label
      function getCenterPoint(boundsMesh){
        var geometry = boundsMesh.geometry;
        var target = new THREE.Vector3();
        console.log(geometry)
        geometry.computeBoundingBox();
        center = geometry.boundingBox.getCenter(target);
        console.log(center);
        //mesh.localToWorld(center);
        return center;
      }
      var labelPosition = getCenterPoint(boundsMesh);
      //create label in camvas
      var name = boundsName;
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var textWidth = (context.measureText(boundsName)).width;
      context.font = "Bold 40px Arial";
      context.fillStyle = "rgba(130, 255, 240, 1)";
      context.fillText(boundsName, textWidth/2.5, 60);

      //create texture
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      var material = new THREE.SpriteMaterial({ map:texture})
      material.transparent = true;
      material.depthTest = false;

      var label = new THREE.Sprite(material);
      label.position.set(labelPosition.x, labelPosition.y, labelPosition.z);
      label.scale.set(1000, 1000, 1000);
      boundsMesh.add(label);



    });
    hyg.map(function(d){
      var lambda = d.ra*Math.PI/180*15,
          phi = d.dec*Math.PI/180,
          cosPhi = Math.cos(phi);
      var x = radius*cosPhi*Math.cos(lambda),
          y = radius*cosPhi*Math.sin(lambda),
          z = radius * Math.sin(phi);
      vertices.push(x);
      vertices.push(y);
      vertices.push(z);
      var rgb = new THREE.Color(starColor(d.ci));
      colors.push(rgb.r, rgb.g, rgb.b);
      sizes.push(scaleMag(d.mag));
      //add labels
      if(d.proper !== ""){
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var textWidth = (context.measureText(d.proper)).width;
        context.font = "Bold 40px Arial";
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.fillText(d.proper, textWidth/2.5, 60);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        var material = new THREE.SpriteMaterial({ map:texture})
        material.transparent = true;

        var label = new THREE.Sprite(material);
        label.position.set(radius*cosPhi*Math.cos(lambda),radius*cosPhi*Math.sin(lambda), radius * Math.sin(phi));
        label.scale.set(1000, 1000, 1000);
        //scene.add(label);
      }
    });

    starsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    starsGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    starsGeometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));


    var uniforms = {
				texture: {value: new THREE.TextureLoader().load('D:/Programowanie/projekty/three_project/textures/lensflare0_alpha.png')},
        scale: {type: 'f', value: window.innerHeight/2}
			};

    var starsMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
      alphaTest: 0.5
    });

    var starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);


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
  trackballControls.rotateSpeed = 0.2;
  trackballControls.zoomSpeed = 1.0;
  trackballControls.panSpeed = 0.2;
  trackballControls.staticMoving = false;
  trackballControls.noPan=false;

  var gui = new dat.GUI();

  var controls = {
    toggleObjects: function(){
      scene.traverse(function(child){
        console.log(child);
        child.visible = true;});
      scene.traverse(function(child){child.visible = false;});
    }
  };

gui.add(controls, 'toggleObjects');

//find coordinates for a label
function findLabelPos(coordArray){

  var min = Math.min(...coordArray),
      max = Math.max(...coordArray),
      mid = min + (max-min)/2;

  return mid;
}

//check if polygon vertices are clockwise
function clockwise(points){
  var edges=[];
  points.forEach(function(d){
    console.log(d);
  })
}

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

  checkHighlight();

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
//
projector = new THREE.Projector();

//event listeners
document.addEventListener('mousemove', onDocumentMouseMove, false);

function checkHighlight(){
  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  vector.unproject(camera);

  var ray = new THREE.Raycaster(camera.position, vector.normalize());

  //var arrow = new THREE.ArrowHelper( vector, camera.position, 100, 0xffffff );
  //scene.add( arrow );


  var intersects = ray.intersectObjects(scene.children);

  //if there is at least one intersection
  if(intersects.length>0){
    //remove highlight from previous boundary
    if(INTERSECTED && intersects[0].object != INTERSECTED){
      INTERSECTED.material.opacity = 0.0;
    }
    INTERSECTED = intersects[0].object;
    //console.log(INTERSECTED);

    INTERSECTED.material.opacity = 0.25;
  }
}
//on click extrude boundary, find intersections, copy objects
function openConstellation(){

}
} //init end
window.onload = init;

function onDocumentMouseMove(event){
// the following line would stop any other event handler from firing
// (such as the mouse's TrackballControls)
//event.preventDefault();

// update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
