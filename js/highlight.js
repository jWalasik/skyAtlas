var resized = false;
function checkHighlight(){
  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  vector.unproject(camera);
  var ray = new THREE.Raycaster(camera.position, vector.normalize());
  if(lvl == 1){
    ray.params.Points.threshold = 1; //raycaster precision
  }
  else if(lvl ==2){
    ray.params.Points.threshold = 100;
  }

  var intersects;
  intersects = ray.intersectObjects(scene.children);
  //if there is at least one intersection
  if(intersects.length>0 && lvl == 1){

    //remove highlight from previous boundary
    if(INTERSECTED && intersects[0].object != INTERSECTED){
      INTERSECTED.material.opacity = 0.0;
    }
    INTERSECTED = intersects[0].object;
    INTERSECTED.material.opacity = 0.25;
    document.getElementById("object").innerHTML = intersects[0].object.children[2].userData[1];
  }
  //check if intersected object is major star
  else if(intersects.length>0 && typeof intersects[0].object.userData == "string"){
    if(resized == true){
      resized = false;
      INTERSECTED.material.size /=1.5;
    }
    INTERSECTED = intersects[0].object;
    if(resized == false){
      resized = true;
      var size = intersects[0].object.material.size;
      INTERSECTED.material.size = size*1.5;
    }

    document.getElementById("object").innerHTML = intersects[0].object.userData;
  }
}
