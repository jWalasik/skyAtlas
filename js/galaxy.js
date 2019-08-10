var makeGalaxy = function(error, hyg, bounds, lines){
  //process data
  let scene = new THREE.Scene();
  scene.selectable=[];
  var galaxy = new THREE.Object3D();
  galaxy.name = "galaxy";
  scene.add(galaxy);

  //add graticule
  galaxy.add(graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0x444444})));
  //add zenith
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var textWidth = (context.measureText("Zenith")).width;
  context.font = "Bold 60px Arial";
  context.fillStyle = "rgba(255, 153, 51, 1)";
  context.fillText("Zenith", textWidth/8.5, 60);

  //create texture
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  var material = new THREE.SpriteMaterial({ map:texture})
  material.transparent = true;
  material.depthTest = true;

  //mark center of the sky
  var zenithMarker = new THREE.Sprite(material);
  zenithMarker.scale.set(1000, 1000, 1000);
  zenithMarker.name = "zenith";
  zenithMarker.position.x = 6977.0;
  zenithMarker.position.y = -3537.0;
  zenithMarker.position.z = 9099.0;

  galaxy.add(zenithMarker)

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
    scene.selectable.push(boundsMesh);
    galaxy.add(boundsMesh);

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
      texture: {value: new THREE.TextureLoader().load('textures/lensflare0_alpha.png')},
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
  galaxy.add(starField);
  //scene.add(starField);

  //process constellation lines
  lines.features.map(function(d){
    let linesMerged = new THREE.Geometry();
    let linesGeometry = new THREE.Geometry();
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
      galaxy.traverse(function(child){
        if(child.userData.name == d.id[0]){
          child.add(lines);
        }
      })//scene traveser end

      linesGeometry = new THREE.Geometry();
    })  //coordinates mapping end

    scene.traverse(function(child){
      if (child.type == 'Points'){
        child.geometry.setDrawRange(0, 10000);
      }
    })
  })  //lines.features.map end89

  //helper object
  // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
  // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  // var cube = new THREE.Mesh( geometry, material );
  // galaxy.add( cube );
  // cube.position.set(0,0,12000)
  // cube.name='helper';

  sceneLvl1 = scene;
  document.getElementById('loading-screen').classList.add('fade-out')
  getLocation();
}
