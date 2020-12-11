uniform float scale;
attribute float size;
attribute float alpha;
varying vec3 vColor;
varying float vAlpha;

void main() {
    vColor = color;
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size*(120.0) * ((scale / -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}