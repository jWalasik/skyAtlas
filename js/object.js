var uniform = {
  time: { type: 'f', value: 0.1 },
  resolution: { type: "v2", value: new THREE.Vector2()},
  color: { type: 'v3', value: new THREE.Vector3()}
}

var surfaceUniform = {
  time: { type: 'f', value: 0.1 },
  resolution: { type: "v2", value: new THREE.Vector2()},
  //color: { type: 'v3', value: new THREE.Vector3()},
  iChannel0: {type: 't', value: new THREE.TextureLoader().load('textures/surface.png')}
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

  var coronaMaterial = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: document.getElementById('haloShaderVert').textContent,
    fragmentShader: document.getElementById('haloShaderFrag').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });
  var corona = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000,1,1), coronaMaterial);
  corona.name = "corona";
  scene.add(corona);

  //surface
  surfaceUniform.resolution.value.x = 1; // window.innerWidth;
  surfaceUniform.resolution.value.y = 1;
  surfaceUniform.iChannel0.value.wrapS = surfaceUniform.iChannel0.value.wrapT = THREE.RepeatWrapping;

  var surfaceMat = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: document.getElementById('surfaceShaderVert').textContent,
    fragmentShader: document.getElementById('surfaceShaderFrag').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });
  var surface = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000,1,1), surfaceMat);
  surface.name = "surface";
  scene.add(surface);

  //skybox
  scene.add(initSky());

  //gyroscope

  sceneLvl3 = scene;
}

function updateObject(object){
  object.lookAt(camera.position);
}
