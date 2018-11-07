//three variables
var scene = new THREE.Scene(),
    sceneLvl1 = new THREE.Scene(),
    sceneLvl2 = new THREE.Scene(),
    sceneLvl3 = new THREE.Scene(),
    trackballControls,
    camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000),
    renderer = new THREE.WebGLRenderer({alpha: true});
//controls
var minMag = 21,
    mouse = {x: 0, y: 0},
    intersections=[],
    INTERSECTED,
    starDatabase=[],
    width = window.innerWidth,
    height = window.innerHeight,
    detailedView = false,
    radius = 12000,
    lvl = 1,
    name,
    realtime = false,
    mode = 0;
//parse data
queue()
  .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv", function(d){
    starDatabase.push(d);
  })
  .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json")
  .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json")
  .await(makeGalaxy);

function init(){
  //THREE.js declarations

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.getElementById('WebGL-Output').appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);
  camera.position.set(0,0,0.0001)
  camera.rotation.set(0,0,0)
  //setup controls
  if(typeof window.orientation !== 'undefined'){
    trackballControls = new THREE.DeviceOrientationControls(camera);
  }
 else {
    trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
  }

  //clock for rendering
  var clock = new THREE.Clock;

  //graphic user interface
  var gui = new dat.GUI();
  var controls = {
    switchCamera: function(){
      switchControls();
    },

    zenithTracking: function(){
      realtime = !realtime;
    },

    toggleLabels: function(){
      scene.traverse(function(child){
        if (child.type == 'Sprite'){
          child.visible = !child.visible;
        }
      })
    },

    toggleLines: function(){
      scene.traverse(function(child){
        if (child.type == 'Line'){

          child.visible = !child.visible;
        }
      })
    },

    toggleStars: function(){
      scene.traverse(function(child){
        if (child.type == 'Points'){

          child.visible = !child.visible;
        }
      })
    },

    filterStars: minMag
  };

  gui.add(controls, 'switchCamera');
  gui.add(controls, 'zenithTracking');
  gui.add(controls, 'toggleLabels');
  gui.add(controls, 'toggleLines');
  gui.add(controls, 'toggleStars');
  gui.add(controls, "filterStars", 0, 120000, 1)
    .onChange( function( value ) {
	     scene.traverse(function(child){
         if (child.type == 'Points'){
           child.geometry.setDrawRange(0, value);
         }
       })
	  });

  render();

  //RENDERING FUNCTION
  function render(){
    
    //if(scene.getObjectByName('helper')) console.log("position:", scene.getObjectByName('helper').position, '\nrotation:', scene.getObjectByName('helper').rotation)
    //if(scene.getObjectByName('container')) console.log(scene.getObjectByName('container').position ,scene.getObjectByName('container').rotation,)
    //chose scene to render
    scene = window["sceneLvl"+lvl];
    if(lvl == 2){
      //scene.getObjectByName(camera.quaternion).quaternion.copy("container");
    }
    else if(lvl == 3){
      updateObject(scene.getObjectByName( "corona" ));
    }

    var delta = clock.getDelta();
    trackballControls.update(delta);
    uniform.time.value += 0.02;
    surfaceUniform.time.value +=0.07;
    checkHighlight();

    //console.log(camera.position)
    requestAnimationFrame(render);

    renderer.render(scene, camera);
  } //render end
}//init end


//event listeners
var start = {x: 0, y: 0};
var end = {x:0, y:0};

document.getElementById('WebGL-Output').addEventListener('mousemove', onDocumentMouseMove, false);
document.getElementById('WebGL-Output').addEventListener('click', onDocumentMouseClick);
document.addEventListener('mousedown', ()=>{start = {x: mouse.x, y: mouse.y}});
document.addEventListener('mouseup', ()=>end = {x: mouse.x, y: mouse.y});
//document.getElementById('return').addEventListener('click', goBack);
//document.getElementById('scroll-down').addEventListener('click', scroll());
//document.getElementById('scroll-up').addEventListener('click', scroll());
window.onscroll = function() {updateUI('offset')}

window.onload = init;

function onDocumentMouseMove(event){
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)

  // update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseClick(event){
  //prevent function execution if dragging
  if (start.x == end.x && start.y == end.y){
    if(lvl == 3){
      return
    }
    //if lvl2 scene is rendered create scene lvl3
    if(lvl == 2 && INTERSECTED.type == "Points"){
      lvl = 3;
      makeObject(INTERSECTED);
    }
    //otherwise create lvl2 scene
    else{
      lvl = 2;
      makeConstellation();
    }
  }
}
