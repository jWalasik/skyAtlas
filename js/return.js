var goBack = function(){

  if(lvl == 2){
	lvl = 1;
    document.getElementById('name-container').innerHTML = "";
	  document.getElementById('description-container').innerHTML = "";
  }
  else if( lvl == 3){
    lvl = 2;
	console.log(sceneLvl2.children);
	document.getElementById('name-container').innerHTML = name;
	document.getElementById('description-container').innerHTML = name;
	console.log(sceneLvl2);
	centerConstellation(sceneLvl2.children[0], 1);
  }
  updateUI();
}
