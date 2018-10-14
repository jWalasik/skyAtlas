var goBack = function(){
  if(lvl == 2){
    document.getElementById('name-container').innerHTML = "";
    document.getElementsByTagName("button")[0].style.visibility = "hidden";
    document.getElementsByTagName("button")[1].style.visibility = "hidden";
    lvl = 1;
  }
  else if( lvl == 3){
    document.getElementById('name-container').innerHTML = name;
    lvl = 2
  }
}
