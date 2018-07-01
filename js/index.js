//controls
var displayStars = true,
    displayConLabels = true,
    displayBoundLabels = true,
    minMag = 21,
    projector,
    mouse = {x: 0, y: 0},
    INTERSECTED,
    starDatabase=[],
    width = window.innerWidth,
    height = window.innerHeight,
    detailedView = false,
    radius = 10000;

    //translate color index to actuall color
    var starColor = d3.scale.linear()
                      .domain([-1, 0.5, 0.73, 1.05, 1.25, 1.60, 2])
                      .range(['#68b1ff', '#93e4ff', '#d8f5ff', '#FFFFFF', '#fffad8', '#ffdda8', '#ffb5b5']);
    //inverse size scalling with magnitude
    var scaleMag = d3.scale.linear()
                      .domain([-2.5, 20])
                      .range([3.5, 0.005]);

function init(){
  //globals
  var mesh,
      graticule,

  //standard three.js stuff
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 100000),
    renderer = new THREE.WebGLRenderer({alpha: true});
    //control = new THREE.TrackballControls(camera),
    clock = new THREE.Clock(),
    marker = 0,
    mouse=new THREE.Vector3();
    camera.position.x = 2000;
    camera.position.y = 2000;
    camera.position.z = -5000;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.getElementById('WebGL-Output').appendChild(renderer.domElement);

  //add graticule
  scene.add(graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0x444444})));

  //parse data
  queue()
    .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv", function(d){
      starDatabase.push(d);
    })
    .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/e564adc14380c69c0b9012c1363750dbef2411f1/bounds.json")
    .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/5335cccd7dc3dad6a634aa5a34aeab3fb6a1f4a5/lines.json")
    .await(processData);

  function processData(error, hyg, bounds, lines){
    //process star data


    //define stars geometries, project them onto sphere
    var starsGeometry = new THREE.BufferGeometry();
    var vertices = [];
    var colors = [];
    var sizes = [];
    var constellations =[];
    var uniforms = {
      color: { type: "c", value: new THREE.Color( 0xffffff ) },
    };

    //process contellation boundaries
    bounds.boundaries.map(function(d){
      var boundsName = d[0];
      var boundsGeometry = new THREE.Geometry();
      var outlineGeometry = new THREE.Geometry();
      var labelX = [];
      var labelY = [];
      var labelZ = [];
      //extract vertices from database
      for(var i=1; i<d.length; i+=2){
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


      //triangulation method
      var triangles = THREE.ShapeUtils.triangulateShape(boundsGeometry.vertices, []);

      for(var i = 0; i < triangles.length; i++){
        boundsGeometry.faces.push(new THREE.Face3(triangles[i][0], triangles[i][2], triangles[i][1]));
      }

      var boundsMaterial = new THREE.MeshBasicMaterial({color: 0x96fff7, transparent:true, opacity:0.0});
      var boundsMesh = new THREE.Mesh(boundsGeometry, boundsMaterial);

      boundsMesh.material.side = THREE.DoubleSide;
      boundsMesh.userData = {name: boundsName};
      scene.add(boundsMesh);
      boundsMesh.add(outline);
      //console.log(boundsMesh);
      //boundary label
      var labelPosition = new THREE.Vector3();

      labelPosition.x = findLabelPos(labelX);
      labelPosition.y = findLabelPos(labelY);
      labelPosition.z = findLabelPos(labelZ);
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
    var processStars = starDatabase.map(function(d){

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
      if(d.mag<2.6){
        sizes.push((scaleMag(d.mag))*2.0);
      }else{
        sizes.push(scaleMag(d.mag));
      }
      constellations.push(d.con);
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
    //console.log(constellations);
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
      d.geometry.coordinates.map(function(coords){
        coords.map(function(d){
          let point = new THREE.Vector3();
          var lambda = d[0]*Math.PI/180,
              phi = d[1]*Math.PI/180,
              cosPhi = Math.cos(phi);
          point.x = radius*cosPhi*Math.cos(lambda);
          point.y = radius*cosPhi*Math.sin(lambda);
          point.z = radius * Math.sin(phi);

          linesGeometry.vertices.push(point);
        })

        var linesMaterial = new THREE.LineBasicMaterial({color: 0x098bdc});
        var lines = new THREE.Line(linesGeometry, linesMaterial);
        lines.userData = d.id;
        scene.traverse(function(child){
          if(child.userData.name == d.id[0]){
            child.add(lines);
          }
        })

        linesGeometry = new THREE.Geometry();
      })  //coordinates mapping end

    })  //lines.features.map end

  }

  //camera controls
  var trackballControls = new THREE.TrackballControls(camera,renderer.domElement);
  trackballControls.rotateSpeed = 0.2;
  trackballControls.zoomSpeed = 1.0;
  trackballControls.panSpeed = 0.2;
  trackballControls.staticMoving = false;
  trackballControls.noPan=true;

  var gui = new dat.GUI();

  var controls = {
    toggleLabels: function(){
      scene.traverse(function(child){
        if (child.type == 'Sprite'){
          child.visible = !child.visible;
        }
      })
    },

    toggleLines: function(){
      scene.traverse(function(child){
        if (child.type == 'Line'){

          child.visible = !child.visible;
        }
      })
    },

    toggleStars: function(){
      scene.traverse(function(child){
        if (child.type == 'Points'){

          child.visible = !child.visible;
        }
      })
    },

    filterStars: minMag
  };

gui.add(controls, 'toggleLabels');
gui.add(controls, 'toggleLines');
gui.add(controls, 'toggleStars');
gui.add(controls, "filterStars", 0, 120000, 1).onChange( function( value ) {

					scene.traverse(function(child){
            if (child.type == 'Points'){
              child.geometry.setDrawRange(0, value);
            }
          })
				});


//find coordinates for a label
function findLabelPos(coordArray){

  var min = Math.min(...coordArray),
      max = Math.max(...coordArray),
      mid = min + (max-min)/2;

  return mid;
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
  if(detailedView === true){
    renderer.render(detailedScene, detailedCamera);
  }
  else {
    renderer.render(scene, camera);
  }

}

//event listeners
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('click', onDocumentMouseClick);

function checkHighlight(){
  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  vector.unproject(camera);

  var ray = new THREE.Raycaster(camera.position, vector.normalize());

  //var arrow = new THREE.ArrowHelper( vector, camera.position, 100, 0xffffff );
  //scene.add( arrow );
  var intersects;
  if(detailedView){
    intersects = ray.intersectObjects(detailedScene.children)
  }else{
    intersects = ray.intersectObjects(scene.children);
  }

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

function onDocumentMouseClick(event){
  //prevent function execution if dragging
  var start = mouse.x;
  //create detailed scene
  detailedView = true;
  makeDetailed();
}



//DETAILED VIEW
var detailedScene = new THREE.Scene,
    detailedCamera = new THREE.PerspectiveCamera(70, width / height, 1, 100000),
    renderer = new THREE.WebGLRenderer({alpha: true});

detailedScene.add(detailedCamera);
detailedCamera.position.set(0, 0, 0);

//process data
var makeDetailed = function(){
  let vertices = [],
      colors = [],
      sizes = [],
      starsGeometryFiltered = new THREE.BufferGeometry();

  //name

  //description

  //stars
  starDatabase.map(function(d){
    if(d.con == INTERSECTED.userData.name && d.mag<minMag){
      //if processing major star create unique object
      if(d.proper !== ""){
        var majorStarGeo = new THREE.Geometry();
        var majorStarMap = new THREE.TextureLoader().load('D:/Programowanie/projekty/three_project/textures/lensflare0_alpha.png');
        majorStarMap.add
        var lambda = d.ra*Math.PI/180*15,
            phi = d.dec*Math.PI/180,
            cosPhi = Math.cos(phi);
        var x = radius*cosPhi*Math.cos(lambda),
            y = radius*cosPhi*Math.sin(lambda),
            z = radius * Math.sin(phi);

        majorStarGeo.vertices.push(new THREE.Vector3(x,y,z));

        var majorStarMat = new THREE.PointsMaterial({color: new THREE.Color(starColor(d.ci)), size: 1000.0, blending: THREE.AdditiveBlending, transparent: true, map: majorStarMap});
        var majorStar = new THREE.Points(majorStarGeo, majorStarMat);
        majorStar.userData = d.proper;
        detailedScene.add(majorStar);

      }
      //else use vertex shader method
      else{
        var lambda = d.ra*Math.PI/180*15,
            phi = d.dec*Math.PI/180,
            cosPhi = Math.cos(phi);
        var x = radius*cosPhi*Math.cos(lambda),
            y = radius*cosPhi*Math.sin(lambda),
            z = radius * Math.sin(phi);
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);
        let rgb = new THREE.Color(starColor(d.ci));
        colors.push(rgb.r, rgb.g, rgb.b);
        sizes.push((scaleMag(d.mag))*1);
      }
    }//filter by name/mag end
  })//database processing end
  starsGeometryFiltered.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  starsGeometryFiltered.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  starsGeometryFiltered.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

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

  var starFieldFiltered = new THREE.Points(starsGeometryFiltered, starsMaterial);
  detailedScene.add(starFieldFiltered);

  //boundary
  var boundsDetailed = INTERSECTED.children[0].clone();
  detailedScene.add(boundsDetailed);

  detailedCamera.lookAt(boundsDetailed.geometry.boundingSphere.center);

  //Lines
  console.log(INTERSECTED.children);
  linesDetailed = INTERSECTED.children[2].clone();
  //linesDetailed.material.lineWidth = 100; //sadly line width is not supported on window
  console.log(INTERSECTED);
  document.getElementById('name-container').innerHTML = linesDetailed.userData[1];
  detailedScene.add(linesDetailed);
}

//wiki lookup
function getWikiData(name){
  var url = 'https://en.wikipedia.org/w/api.php?action=query&titles='+name+'_(constellation)&prop=revisions&rvprop=content&format=json&formatversion=2';
  console.log(url);
}
getWikiData("Andromeda");
