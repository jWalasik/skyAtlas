var goBack = function(){
  if(lvl == 2){
    camera.position.set(prevPos.x, prevPos.y,prevPos.z)
    camera.rotation=prevRot
    trackballControls.update();
	  lvl = 1;
    document.getElementById('name-container').innerHTML = "";
	  document.getElementById('description-container').innerHTML = "";
    updateUI('default');
    if(typeof window.orientation !== 'undefined') switchControls();
    camera.zoom = 1
    camera.updateProjectionMatrix ()
  }
  else if( lvl == 3){
    camera.position.set(prevPos.x, prevPos.y,prevPos.z)
    camera.rotation=prevRot
    trackballControls.update();
    lvl = 2;
  	document.getElementById('name-container').innerHTML = name;
  	document.getElementById('description-container').innerHTML = name;
    //centerConstellation(sceneLvl2.children[0], 1);
    
  }
}
