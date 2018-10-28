var resized = false;
function checkHighlight(){
  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  if(typeof window.orientation !== 'undefined') vector.set(0,0,1)
  vector.unproject(camera);
  var ray = new THREE.Raycaster(camera.position, vector.normalize());

  var intersects;
  if(lvl == 1){
    ray.params.Points.threshold = 1; //raycaster precision
    intersects = ray.intersectObjects(intersections);
  }
  else if(lvl ==2){
    ray.params.Points.threshold = 100;
    intersects = ray.intersectObjects(scene.children[0].children);
  }

  //if there is at least one intersection
  if(lvl == 1 && intersects.length>0){
    //remove highlight from previous boundary
    if(INTERSECTED && intersects[0].object != INTERSECTED){
      INTERSECTED.material.opacity = 0.0;
    }
    INTERSECTED = intersects[0].object;
    INTERSECTED.material.opacity = 0.25;
    //document.getElementById("object").innerHTML = intersects[0].object.children[2].userData[1];
  }
  //check if intersected object is major star
  else if(lvl==2 && intersects.length>0 && typeof intersects[0].object.userData == "string"){

    if(resized == true){
      resized = false;
      INTERSECTED.material.size /= 1.5;
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
