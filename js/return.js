var goBack = function(){
  if(lvl == 2){
	lvl = 1;
    document.getElementById('name-container').innerHTML = "";
	document.getElementById('description-container').innerHTML = "";
    document.getElementsByTagName("button")[0].style.visibility = "hidden";
    document.getElementsByTagName("button")[1].style.visibility = "hidden";    
  }
  else if( lvl == 3){
    lvl = 2;
	console.log(sceneLvl2.children);
	document.getElementById('name-container').innerHTML = name;
	document.getElementById('description-container').innerHTML = name;
	console.log(sceneLvl2);
	centerConstellation(sceneLvl2.children[0], 1);
  }
}
