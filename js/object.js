var uniform = {
  time: { type: 'f', value: 0.1 },
  resolution: { type: "v2", value: new THREE.Vector2()}
}
//SCENE lvl3
var makeObject = function(object){

  //append name and get description from wikipedia
  var ahref = object.userData;
  //ahref = ahref.replace(/ /g,"_"); //replace space with underscore
  document.getElementById('name-container').innerHTML = object.userData;

  getWikiData(ahref);

  let scene = new THREE.Scene();

  //corona

  uniform.resolution.value.x = 1; // window.innerWidth;
  uniform.resolution.value.y = 1; // window.innerHeight;

  var coronaMateraial = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: document.getElementById('starShaderVert').textContent,
    fragmentShader: document.getElementById('starShaderFrag').textContent,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 1
  });
  var corona = new THREE.Mesh(new THREE.PlaneGeometry(700,700,1,1), coronaMateraial);

  scene.add(corona);
  console.log(scene);
  var starSurfaceMap = new THREE.TextureLoader().load('textures/surface.png'),
      lensflare = new THREE.TextureLoader().load('textures/lensflare0_alpha.png'),
      corona = new THREE.TextureLoader().load('textures/corona.png');

  console.log(object);
  let starGeometry = new THREE.SphereGeometry(object.material.size, 20, 20);
  let starMaterial = new THREE.MeshBasicMaterial({color: object.material.color, wireframe: true})

  let starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.position.set(0,0,0);

  scene.add(starMesh);

  sceneLvl3 = scene;
}
