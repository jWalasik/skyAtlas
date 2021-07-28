import * as THREE from '../lib/three.module.js'

export const animateObject = () => {
  coronaUniform.time.value += 0.02
  surfaceUniform.time.value += 0.07
}

const coronaUniform = {
  time: {type: 'f', value: 0.1},
  resolution: {type: 'v2', value: new THREE.Vector2()},
  color: {type: 'v3', value: new THREE.Vector3()},
}

const surfaceUniform = {
  time: {type: 'f', value: 0.1},
  speed: {type: 'f', value: 0.02},
  resolution: {type: 'v2', value: new THREE.Vector2()},
  color: {type: 'v3', value: new THREE.Vector3()},
  veinColor: {type: 'v3', value: new THREE.Vector3(1,1,1)},
  iChannel0: {type: 't', value: new THREE.TextureLoader().load('./assets/lensflare0_alpha.png')}
}

export const Object = (name, type) => {
  coronaUniform.resolution.value.x = 1
  coronaUniform.resolution.value.y = 1
  coronaUniform.color.value.x = .1
  coronaUniform.color.value.y = .1
  coronaUniform.color.value.z = .1

  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: coronaUniform,
    vertexShader: shaders.coronaVertex,
    fragmentShader: shaders.coronaFragment,
    side: THREE.DoubleSide,
    transparent: true
  })

  const corona = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 1, 1), coronaMaterial)
  corona.name = 'corona'
  
  surfaceUniform.resolution.value.x = 1; // window.innerWidth;
  surfaceUniform.resolution.value.y = 1;
  surfaceUniform.iChannel0.value.wrapS = surfaceUniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
  surfaceUniform.color.value.x = .2
  surfaceUniform.color.value.y = .5
  surfaceUniform.color.value.z = .5

  const surfaceMaterial = new THREE.ShaderMaterial({
    uniforms: surfaceUniform,
    vertexShader: shaders.surfaceVertex,
    fragmentShader: shaders.surfaceFragment,
    side: THREE.DoubleSide,
    transparent: true
  })
  const surface = new THREE.Mesh(new THREE.SphereGeometry(200, 30,30), surfaceMaterial)
  surface.name='surface'

  return {
    corona: corona,
    surface: surface
  }
}

const shaders = {
  surfaceVertex: `
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
  `,
  surfaceFragment: `
    precision highp float;

    uniform float time;
    uniform float speed;
    uniform vec3 veinColor;
    //uniform float veinBrightness;
    uniform vec3 color;
    uniform vec2 resolution;
    varying vec2 vUv;
    varying vec3 fPosition;
    varying vec3 fNormal;
    
    uniform sampler2D iChannel0;
    
    #define PI 3.14159265
    
    //vec3 saturate( vec3 i ) {return clamp( i, 0.0, 1.0 );}
    //float saturate( float i ) {return clamp( i, 0.0, 1.0 );}
    
    vec4 texture2DNearest( sampler2D _tex, vec2 _uv, vec2 _reso ){
      return texture2D( _tex, ( floor( _uv * _reso ) + 0.5 ) / _reso );
    }
    
    float expCurve( float _in, float _lv ){
      return sign( 0.5 - _in ) * ( exp( -abs( _in - 0.5 ) * _lv ) - 1.0 ) * 0.5 + 0.5;
    }
    
    vec4 noise( vec2 _uv, vec2 _mul, vec2 _off, float _iter, float _lacu ){
      vec4 sum = vec4( 0.0 );
    
      for( float i=0.0; i<99.0; i+=1.0 ){
          vec2 uv0 = ( ( _uv ) * _mul + _off ) * 0.01 * exp( i * _lacu ) + time * speed * i * 0.01;
          vec2 uv1 = ( ( _uv + vec2( 1.0, 0.0 ) ) * _mul + _off ) * 0.01 * exp( i * _lacu ) + time * speed * i * 0.01;
          vec4 tex0 = texture2D( iChannel0, uv0 );
          vec4 tex1 = texture2D( iChannel0, uv1 );
          vec4 tex = mix( tex1, tex0, expCurve( _uv.x, 10.0 ) );
          sum += tex / pow( 2.0, i + 1.0 );
          if( _iter < i ){ break; }
      }
    
      return sum;
    }
    
    vec4 Body_main(){
          vec4 Body_gl_FragColor = vec4(0.0);
          vec2 uv = mod( vUv.xy / resolution, 1.0 );
          uv = mod( uv + vec2( 0.5, 0.0 ), 1.0 );
    
          // 1
          vec3 col1 = vec3( 0.0 );
    
          float line = 0.0;
          for( float i=0.0; i<8.5; i+=1.0 ){
              vec2 mul = vec2( exp( i * 0.3 ) );
              vec2 off = vec2( i * 423.1 );
    
              float lineL = 1.0 - abs( noise( uv, mul * vec2( 2.0, 1.5 ), off, 2.0, 0.4 ).x - 0.5 ) * 2.0;
              float lineS = 1.0 - abs( noise( uv, mul * vec2( 14.0 ), off + 10.0, 6.0, 0.7 ).x - 0.5 ) * 2.0;
    
              float lineT = expCurve( pow( lineL, 200.0 ), 7.0 ) * 1.0;
              lineT += pow( lineL, 12.0 ) * expCurve( pow( lineS, 40.0 ), 10.0 ) * 1.0;
              //lineT = saturate( lineT );
              lineT *= expCurve( noise( uv, mul * 7.0, off + 20.0, 6.0, 1.0 ).x * 0.88, 20.0 );
    
              line += lineT * exp( -i * 0.01 );
          }
    
          //line = saturate( line );
    
          col1 = vec3( 0.9 ) * color;
    
          col1 = mix(
              col1,
              color * 0.8,
              expCurve( noise( uv, vec2( 4.0 ), vec2( 40.0 ), 5.0, 0.7 ).x * 0.7, 14.0 )
          );
    
          col1 = mix(
              col1,
              color * 0.8,
              expCurve( noise( uv, vec2( 4.0 ), vec2( 50.0 ), 5.0, 0.7 ).x * 0.7, 5.0 ) * 0.7
          );
    
          col1 = mix(
              col1,
              color * 2.0, //4.0 = veinBrightness
              line
          );
    
          vec3 col = col1;
          Body_gl_FragColor = vec4(col, 1.0);
          return Body_gl_FragColor *= 1.0;
    
      }
    vec4 Glow_main(){
      vec4 Glow_gl_FragColor = vec4(1.0);
      vec3 normal = normalize(fNormal);
      vec3 eye = normalize(-fPosition.xyz);
      float rim = smoothstep(0.2, 1.2, 1.0 - dot(normal, eye));
      Glow_gl_FragColor = vec4( clamp(rim, 0.0, 1.0) * 1.0 * color, 1.0 );
      return Glow_gl_FragColor *= 1.0;
    }
    
    void main(){
          gl_FragColor = (Body_main() + Glow_main());
    }
  `,
  coronaVertex: `
    varying vec2 vUv;

    void main()
    {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  coronaFragment: `
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
    #define SQ3 1.73205080757
    #define SIZE 400.0
    #define I_R 100.0
    #define F_R 400.0
    #define SPEED 0.4

    precision highp float;

    precision highp int;
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color;
    varying vec2 vUv;
    float random(in vec2 _st)
    {
      return fract(sin(dot(_st.xy, vec2(12.9898, 78.233))) * 43758.54531237);
    }
    float noise(in vec2 _st)
    {
      vec2 i = floor(_st);
      vec2 f = fract(_st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3. - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
    }
    float noise(float _st)
    {
      return fract(abs(sin(_st)));
    }
    vec4 flare(float alpha, vec2 main, float seed, float dir)
    {
      float amnt = 0.6 + sin(seed) * 8.0;
      float ang = atan(main.y, main.x);
      float t = time * SPEED * dir;
      float n = noise(vec2((seed + ang * amnt + t * 0.1) + cos(alpha * 13.8 + noise(t + ang + seed) * 3.0) * 0.2 + seed / 20.0, seed + t + ang));
      n *= pow(noise(vec2(seed * 194.0 + ang * amnt + t + cos(alpha * 2.0 * n + t * 1.1 + ang) * 2.8, seed + t + ang) + alpha), 2.0);
      n *= pow(noise(vec2(seed * 134.0 + ang * amnt + t + cos(alpha * 2.2 * n + t * 1.1 + ang) * 1.1, seed + t + ang) + alpha), 3.0);
      n *= pow(noise(vec2(seed * 123.0 + ang * amnt + t + cos(alpha * 2.3 * n + t * 1.1 + ang) * 0.8, seed + t + ang) + alpha), 4.0);
      n *= pow(alpha, 2.6);
      n *= (ang + PI) / 2.0 * (TWO_PI - ang - PI);
      n += sqrt(alpha * alpha) * 0.26;
      return vec4(pow(n * 2.1, 2.0), n, n, n);
    }
    void main()
    {
      float size = 600.0;
      vec2 uv = (vUv.xy * size - resolution.xy * size * 0.5) / resolution.y;
      vec4 c = vec4(0.0);
      float len = length(uv);
      float alpha = pow(clamp(F_R - len + I_R - 40.0, 0.0, F_R) / F_R, 6.0);
      c += flare(alpha, uv, 74.621, 1.0);
      c += flare(alpha, uv, 35.1412, 1.0);
      c += flare(alpha, uv, 21.5637, 1.0);
      c += flare(alpha, uv, 1.2637, 1.0);
      c.xyz = clamp(c.xyz, 0.0, 1.0);
      if (alpha >= 0.99)
      {
        c.a = alpha;
      }
      gl_FragColor = vec4(color, c.a);
    }
  `
}