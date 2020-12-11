uniform sampler2D texture;
uniform float time;
varying vec3 vColor;
varying float vAlpha;

void main() {
    gl_FragColor = vec4( vColor * (1.0 - (sin(time*vAlpha))*0.3) , 1 );
    gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
}