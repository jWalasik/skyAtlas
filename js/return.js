var goBack = function(){
  if(lvl == 2){
	  lvl = 1;
    document.getElementById('name-container').innerHTML = "";
	  document.getElementById('description-container').innerHTML = "";
    updateUI('default');
    if(typeof window.orientation !== 'undefined') switchControls();
  }
  else if( lvl == 3){
    lvl = 2;
  	document.getElementById('name-container').innerHTML = name;
  	document.getElementById('description-container').innerHTML = name;
  	centerConstellation(sceneLvl2.children[0], 1);
  }
}
