var goBack = function(){
  console.log('returning')
  if(lvl == 2){
    lvl = 1;
  }
  else if( lvl == 3){
    lvl = 2
  }
  selectCam();
}
