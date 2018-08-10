var center;

var makeConstellation = function(){
  let scene = new THREE.Scene();

  let vertices = [],
      colors = [],
      sizes = [],
      starsGeometryFiltered = new THREE.BufferGeometry();

  let size = 10000;
  //stars
  starDatabase.map(function(d){
    if(d.con == INTERSECTED.userData.name){
      //if processing major star create unique object
      if(d.proper !== ""){
        var majorStarGeo = new THREE.Geometry();
        var majorStarMap = new THREE.TextureLoader().load('textures/lensflare0_alpha.png');
        majorStarMap.add
        var lambda = d.ra*Math.PI/180*15,
            phi = d.dec*Math.PI/180,
            cosPhi = Math.cos(phi);
        var x = radius*cosPhi*Math.cos(lambda),
            y = radius*cosPhi*Math.sin(lambda),
            z = radius * Math.sin(phi);

        majorStarGeo.vertices.push(new THREE.Vector3(x,y,z));
        var majorStarMat = new THREE.PointsMaterial({
          color: new THREE.Color(starColor(d.ci)),
          size: (scaleMag(d.mag)*400),
          blending: THREE.AdditiveBlending,
          transparent: true,
          map: majorStarMap,
        });
        var majorStar = new THREE.Points(majorStarGeo, majorStarMat);
        majorStar.userData = d.proper;
        scene.add(majorStar);
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
        sizes.push((scaleMag(d.mag))*2);
      }
    }//filter by name/mag end
  })//database processing end
  starsGeometryFiltered.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  starsGeometryFiltered.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  starsGeometryFiltered.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

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

  var starFieldFiltered = new THREE.Points(starsGeometryFiltered, starsMaterial);
  scene.add(starFieldFiltered);

  //boundary
  var boundsDetailed = INTERSECTED.children[0].clone();
  scene.add(boundsDetailed);
  center = boundsDetailed.geometry.boundingSphere.center;

  //Lines
  linesDetailed = INTERSECTED.children[2].clone();
  //linesDetailed.material.lineWidth = 100; //sadly line width is not supported on windows

  scene.add(linesDetailed);
  console.log(linesDetailed)

  var planeGeo = new THREE.PlaneGeometry(size, size);
  var planeMat = new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide});
  var plane = new THREE.Mesh(planeGeo, planeMat);
  plane.position.set(0,0,0);

  //2d Geometry
  console.log(starDatabase)

  scene.add(plane);

  //3d to 2d
/*
  var plane = new THREE.Plane().setFromCoplanarPoints(pointA, pointB, pointC)
  fillGeometry(geometry);

  var positionAttr = geometry.getAttibute("position");
  for (var i = 0; i < positionAttr.array.length; i+=3){
    var point = new THREE.Vector3(positionAttr.array[i],positionAttr.array[i+1],positionAttr.array[i+2]);
    var projectedPoint = plane.projectPoint();
    positionAttr.array[i] = projectedPoint.x;
    positionAttr.array[i+1] = projectedPoint.y;
    positionAttr.array[i+2] = projectedPoint.z;
  }
  positionAttr.needsUpdate = true;
  */

  //append name and get description from wikipedia
  var ahref = linesDetailed.userData[1];
  ahref = ahref.replace(/ /g,"_"); //replace space with underscore
  document.getElementById('name-container').innerHTML = linesDetailed.userData[1];
  getWikiData(ahref+'_(constellation)');

  sceneLvl2 = scene;
}
