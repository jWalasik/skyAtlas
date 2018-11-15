var goBack = function(){
  if(lvl == 2){
    camera.position.set(prevPos.x, prevPos.y,prevPos.z)
    camera.rotation=prevRot
    trackballControls.update();
    console.log('current pos: ', camera.position, 'stored pos: ', prevPos)
	  lvl = 1;
    document.getElementById('name-container').innerHTML = "";
	  document.getElementById('description-container').innerHTML = "";
    updateUI('default');
    if(typeof window.orientation !== 'undefined') switchControls();
    
  }
  else if( lvl == 3){
    camera.position.set(prevPos.x, prevPos.y,prevPos.z)
    camera.rotation=prevRot
    console.log('current pos: ', camera.position, 'stored pos: ', prevPos)
    trackballControls.update();
    lvl = 2;
  	document.getElementById('name-container').innerHTML = name;
  	document.getElementById('description-container').innerHTML = name;
    //centerConstellation(sceneLvl2.children[0], 1);
    
  }
}
