var center;

var makeConstellation = function(){
  let scene = new THREE.Scene();

  let vertices = [],
      colors = [],
      sizes = [],
      starsGeometryFiltered = new THREE.BufferGeometry();
  console.log(INTERSECTED)

  var container = new THREE.Object3D();

  //stars
  starDatabase.map(function(d){

    if(d.con == INTERSECTED.userData.name){
      //if processing major star create unique object
      if(d.proper !== ""){
        var majorStarGeo = new THREE.Geometry();
        var majorStarMap = new THREE.TextureLoader().load('textures/lensflare0_alpha.png');
        //3D

        var lambda = d.ra*Math.PI/180*15, //arc length, range 360 deg
            phi = d.dec*Math.PI/180,      //arc length, range 90 deg
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
        container.add(majorStar);

      }
      //else use vertex shader method
      else{
        //3D
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
  //starFieldFiltered.geometry.center();
  container.add(starFieldFiltered);

  //boundary
  var boundsDetailed = INTERSECTED.children[0].clone();
  //boundsDetailed.geometry.center();
  container.add(boundsDetailed);

  //lines
  var linesGeometry = new THREE.Geometry();
  for (var i=2; i<INTERSECTED.children.length; i++){
    console.log(INTERSECTED.children.length)
    line = INTERSECTED.children[i].clone();
    container.add(line);
  }

  new THREE.Box3().setFromObject(container).getCenter(container.position).multiplyScalar(-1);
  center = boundsDetailed.geometry.boundingSphere.center;

  //append name and get description from wikipedia
  var ahref = INTERSECTED.children[2].userData[1];
  ahref = ahref.replace(/ /g,"_"); //replace space with underscore
  document.getElementById('name-container').innerHTML = INTERSECTED.children[2].userData[1];
  getWikiData(ahref+'_(constellation)');

  scene.add(container)
  sceneLvl2 = scene;

}
