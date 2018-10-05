var goBack = function(){
  console.log('returning')
  if(lvl == 2){
    document.getElementById('name-container').innerHTML = "";
    lvl = 1;
  }
  else if( lvl == 3){
    document.getElementById('name-container').innerHTML = "";
    lvl = 2
  }
}
