// Set the precision for data types used in this shader
    precision highp float;

    // Default attributes provided by THREE.js. Attributes are only available in the
    // vertex shader. You can pass them to the fragment shader using varyings
    //attribute vec3 position;
    //attribute vec3 normal;
    //attribute vec2 uv;
    attribute vec2 uv2;

    // Examples of variables passed from vertex to fragment shader
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec2 vUv2;
    varying vec3 fNormal;
    varying vec3 fPosition;

    void main() {

        // To pass variables to the fragment shader, you assign them here in the
        // main function. Traditionally you name the varying with vAttributeName
        vNormal = normal;
        vUv = uv;
        vUv2 = uv2;
        vPosition = position;
        //glow
        fNormal = normalize(normalMatrix*normal);
        vec4 pos = modelViewMatrix * vec4(position, 1.0);
        fPosition = pos.xyz;

        // This sets the position of the vertex in 3d space. The correct math is
        // provided below to take into account camera and object data.
        //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * pos;
    }