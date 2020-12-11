import * as THREE from '../lib/three.module.js'

const Label = (id, geometry) => {
  var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var textWidth = (context.measureText(id)).width;
    context.font = "Bold 12px Arial";
    context.fillStyle = "rgba(130, 255, 240, 1)";
    context.fillText(id, textWidth/2.5, 60);

    //create texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    var material = new THREE.SpriteMaterial({ map:texture, sizeAttenuation: false})
    material.transparent = true;
    material.depthTest = false;

    var label = new THREE.Sprite(material);
    const {x,y,z} = geometry.boundingSphere.center
    label.position.set(x,y,z)
    return label
}

export default Label