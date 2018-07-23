var uniform = {
  time: { type: 'f', value: 0.1 },
  resolution: { type: "v2", value: new THREE.Vector2()},
  color: { type: 'v3', value: new THREE.Vector3()}
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
  uniform.color.value.x = object.material.color.r;
  uniform.color.value.y = object.material.color.g;
  uniform.color.value.z = object.material.color.b;
  console.log(uniform.color);

  var coronaMateraial = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: document.getElementById('starShaderVert').textContent,
    fragmentShader: document.getElementById('starShaderFrag').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });
  var corona = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000,1,1), coronaMateraial);

  scene.add(corona);

  var starSurfaceMap = new THREE.TextureLoader().load('textures/surface.png'),
      lensflare = new THREE.TextureLoader().load('textures/lensflare0_alpha.png'),
      corona = new THREE.TextureLoader().load('textures/corona.png');

  let starGeometry = new THREE.SphereGeometry(object.material.size, 20, 20);
  let starMaterial = new THREE.MeshBasicMaterial({color: object.material.color, wireframe: true})
  //1, 0.9098039215686274, 0.7333333333333333
  let starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.position.set(0,0,0);

  //scene.add(starMesh);

  sceneLvl3 = scene;
}
