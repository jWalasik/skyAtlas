//SCENE lvl3
var makeObject = function(object){
  let scene = new THREE.Scene();
  var starSurfaceMap = new THREE.TextureLoader().load('D:/Programowanie/projekty/three_project/textures/surface.png'),
      lensflare = new THREE.TextureLoader().load('D:/Programowanie/projekty/three_project/textures/lensflare0_alpha.png'),
      corona = new THREE.TextureLoader().load('D:/Programowanie/projekty/three_project/textures/corona.png');

  console.log(object);
  let starGeometry = new THREE.SphereGeometry(object.material.size, 100, 100);
  let starMaterial = new THREE.MeshBasicMaterial({color: object.material.color})

  let starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.position.set(0,0,0);

  scene.add(starMesh);

  sceneLvl3 = scene;
}
