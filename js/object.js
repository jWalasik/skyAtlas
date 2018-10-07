var uniform = {
  time: { type: 'f', value: 0.1 },
  resolution: { type: "v2", value: new THREE.Vector2()},
  color: { type: 'v3', value: new THREE.Vector3()}
}

var surfaceUniform = {
  time: { type: 'f', value: 0.1 },
  speed: { type: 'f', value: 0.02},
  resolution: { type: "v2", value: new THREE.Vector2()},
  color: { type: 'v3', value: new THREE.Vector3()},
  veinColor: { type: 'v3', value: new THREE.Vector3(1,1,1)},
  iChannel0: {type: 't', value: new THREE.TextureLoader().load('textures/noise.png')}
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

  //star body
  surfaceUniform.resolution.value.x = 1; // window.innerWidth;
  surfaceUniform.resolution.value.y = 1;
  surfaceUniform.iChannel0.value.wrapS = surfaceUniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
  surfaceUniform.color.value.x = object.material.color.r;
  surfaceUniform.color.value.y = object.material.color.g;
  surfaceUniform.color.value.z = object.material.color.b;
  console.log(surfaceUniform.color);
  console.log(uniform.color);
  var surfaceMat = new THREE.ShaderMaterial({
    uniforms: surfaceUniform,
    vertexShader: document.getElementById('bodyShaderVert').textContent,
    fragmentShader: document.getElementById('bodyShaderFrag').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });
  var surface = new THREE.Mesh(new THREE.SphereGeometry(185,50,50), surfaceMat);
  surface.name = "surface";
  scene.add(surface);

  //skybox
  scene.add(initSky());
  
  sceneLvl3 = scene;
}

function updateObject(object){
  object.lookAt(camera.position);
}
