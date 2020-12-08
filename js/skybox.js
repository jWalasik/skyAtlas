function initSky(){
	var prefix = 'assets/skybox/';
	var directions = ['px','nx','py','ny','pz','nz',];
	var suffix = '.jpg';
	var skyGeometry = new THREE.CubeGeometry(50000,50000,50000);

	var materialArray = [];
	for (var i = 0; i<6; i++){
		materialArray.push(new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load( prefix + directions[i] + suffix ),
			side: THREE.BackSide,
			depthWrite: false,
			depthTest: false,
		}));
	}
	var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
	var skybox = new THREE.Mesh(skyGeometry, skyMaterial);
	return skybox;
}
