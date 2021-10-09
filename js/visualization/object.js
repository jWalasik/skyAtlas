import * as THREE from '../lib/three.module.js'
import { getWikiData } from '../utils/wikiLookup.js'

export const animateObject = () => {
  coronaUniform.time.value += 0.01
  surfaceUniform.time.value += 1.0
}

const transition = (object, step, end) => {
  setTimeout(()=>{
      const {x,y,z} = object.position.multiplyScalar(step)
      object.position.set(x,y,z)
      const distance = object.position.distanceTo(new THREE.Vector3(0,0,0))
      if(distance > end ) transition(object, step, end);
  }, 25)
}

const coronaUniform = {
  time: {type: 'f', value: 0.1},
  resolution: {type: 'v2', value: new THREE.Vector2()},
  color: {type: 'v3', value: new THREE.Vector3()},
}

const surfaceUniform = {
  time: {type: 'f', value: 0.1},
  speed: {type: 'f', value: 0.2},
  scale: {type: 'f', value: .1},
  contrast: {type: 'f', value: .7},
  brightness: {type: 'f', value: .1},
  resolution: {type: 'v2', value: new THREE.Vector2()},
  color: {type: 'v3', value: new THREE.Vector3()},
  veinColor: {type: 'v3', value: new THREE.Vector3(.7,.71,.71)},
  iChannel0: {type: 't', value: new THREE.TextureLoader().load('./assets/lensflare0_alpha.png')}
}

export const StarBody = (data) => {
  const container = new THREE.Object3D()
  container.name = data.name

  const direction = window.camera.getWorldDirection()
  const {x,y,z} = direction.multiplyScalar(16000);
  container.position.set(x,y,z)
  transition(container, .90, 1000);

  coronaUniform.resolution.value.x = 1
  coronaUniform.resolution.value.y = 1
  coronaUniform.color.value.x = data.material.color.r
  coronaUniform.color.value.y = data.material.color.g
  coronaUniform.color.value.z = data.material.color.b

  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: coronaUniform,
    vertexShader: shaders.coronaVertex,
    fragmentShader: shaders.coronaFragment,
    side: THREE.DoubleSide,
    transparent: true
  })

  const corona = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 1, 1), coronaMaterial)
  corona.name = 'corona'
  
  // surfaceUniform.resolution.value.x = 1; // window.innerWidth;
  // surfaceUniform.resolution.value.y = 1;
  // surfaceUniform.iChannel0.value.wrapS = surfaceUniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
  // surfaceUniform.color.value.x = data.material.color.r
  // surfaceUniform.color.value.y = data.material.color.g
  // surfaceUniform.color.value.z = data.material.color.b

  // const surfaceMaterial = new THREE.ShaderMaterial({
  //   uniforms: surfaceUniform,
  //   vertexShader: shaders.surfaceVertex,
  //   fragmentShader: shaders.surfaceFragment,
  //   side: THREE.DoubleSide,
  //   transparent: true
  // })
  // const surface = new THREE.Mesh(new THREE.SphereGeometry(190, 30,30), surfaceMaterial)
  // surface.name='surface'

  container.add(corona)
  //container.add(surface)

  container.lookAt(window.camera.position)

  document.getElementById('controls-name').innerText = data.name

  //fetch description
  const wikiHref = data.name.replace(/ /g, '_') + '_(star)'
  getWikiData(wikiHref)
    .then(res => {
      const description = document.getElementById('controls-description')
      description.innerHTML = res.query.pages[0].extract || 'Sorry! We could not find relevant wikipedia entry regarding this object :('  
    })
    .catch(err => console.log(err))

  window.scene.add(container)
}

const shaders = {
  surfaceVertex: `
    precision highp float;
    precision highp int;
    attribute vec2 uv2;
    
    uniform float speed;
    uniform float time;
    uniform float scale;
    
    varying vec3 vTexCoord3D;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 fPosition;
    varying vec3 fNormal;
    
    void main( void ) {
    
      vec4 mPosition = modelMatrix * vec4( position, 1.0 );
      vNormal = normalize( normalMatrix * normal );
      vViewPosition = cameraPosition - mPosition.xyz;
    
      vTexCoord3D = scale * ( position.xyz + vec3( 0.0, 0.0, time * speed ) );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
    }
  `,
  surfaceFragment: `
  // http://alteredqualia.com/three/examples/webgl_shader_fireball.html
  precision highp float;
  precision highp int;
  
  //
  // Description : Array and textureless GLSL 3D simplex noise function.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : ijm
  //     Lastmod : 20110409 (stegu)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //
  
  uniform float time;
  uniform float contrast;
  uniform float brightness;
  uniform vec3 color;
  
  varying vec3 vTexCoord3D;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 fPosition;
  varying vec3 fNormal;
  
  vec4 permute( vec4 x ) {  
    return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );  
  }
  
  vec4 taylorInvSqrt( vec4 r ) {  
    return 1.79284291400159 - 0.85373472095314 * r;  
  }
  
  float snoise( vec3 v ) {  
    const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );
    const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );
  
    // First corner
  
    vec3 i  = floor( v + dot( v, C.yyy ) );
    vec3 x0 = v - i + dot( i, C.xxx );
  
    // Other corners
  
    vec3 g = step( x0.yzx, x0.xyz );
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
  
    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
  
    // Permutations
  
    i = mod( i, 289.0 );
    vec4 p = permute( permute( permute(
         i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )
         + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )
         + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );
  
    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
  
    float n_ = 1.0 / 7.0; // N=7
  
    vec3 ns = n_ * D.wyz - D.xzx;
  
    vec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)
  
    vec4 x_ = floor( j * ns.z );
    vec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)
  
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs( x ) - abs( y );
  
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
  
    vec4 s0 = floor( b0 ) * 2.0 + 1.0;
    vec4 s1 = floor( b1 ) * 2.0 + 1.0;
    vec4 sh = -step( h, vec4( 0.0 ) );
  
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  
    vec3 p0 = vec3( a0.xy, h.x );
    vec3 p1 = vec3( a0.zw, h.y );
    vec3 p2 = vec3( a1.xy, h.z );
    vec3 p3 = vec3( a1.zw, h.w );
  
    // Normalise gradients
  
    vec4 norm = taylorInvSqrt( vec4( dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3) ) );
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
  
    // Mix final noise value
  
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3) ), 0.0 );
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                  dot(p2,x2), dot(p3,x3) ) );
  
  }
  
  float heightMap( vec3 coord ) {
  
    float n = abs( snoise( coord ) );
  
    n += 0.25   * abs( snoise( coord * 2.0 ) );
    n += 0.25   * abs( snoise( coord * 4.0 ) );
    n += 0.125  * abs( snoise( coord * 8.0 ) );
    n += 0.0625 * abs( snoise( coord * 16.0 ) );
  
    return n;
  
  }
  
  void main( void ) {
  
    // height
  
    float n = heightMap( vTexCoord3D );
  
    // color
  
    vec3 baseColor = color * vec3( color.r * 1.5 - n + 0.5, color.g - n + 0.5, color.b * 0.5 - n + 0.5 );
  
    // normal
  
    const float e = 0.001;
  
    float nx = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
    float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
    float nz = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );
  
    vec3 normal = normalize( vNormal + contrast * vec3( n - nx, n - ny, n - nz ) / e );
  
    // diffuse light
  
    vec3 vLightWeighting = vec3( brightness );
  
    vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );
    float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.25 + 0.75;
    vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;
  
    // specular light
  
    vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );
  
    float dirDotNormalHalf = dot( normal, dirHalfVector );
  
    float dirSpecularWeight = 0.0;
    if ( dirDotNormalHalf >= 0.0 )
      dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 5.0 );
  
    vLightWeighting += color * dirSpecularWeight * n * 2.0;

    vec3 eye = normalize(-fPosition.xyz);
    float rim = smoothstep(0.0, 1.0, 1.0 - dot(normal, eye));
    
    vec3 shade = clamp(rim, 0.1, 0.7) * baseColor;

    gl_FragColor = vec4( shade * vLightWeighting, 1.0 );
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
    #define SIZE 100.0
    #define I_R 80.0
    #define F_R 120.0
    #define SPEED 1.4

    precision highp float;

    precision highp int;
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color;
    varying vec2 vUv;
    float random(in vec2 _st)
    {
      return fract(sin(dot(_st.xy, vec2(8.9898, 28.233))) * 23758.54531237);
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
      float amnt = .6 + sin(seed) * 12.0;
      float ang = atan(main.y, main.x);
      float t = time * SPEED * dir;
      float n = noise(vec2((seed + ang * amnt + t * 0.1) + cos(alpha * 13.8 + noise(t + ang + seed) * 3.0) * 0.2 + seed / 12.0, seed + t + ang));
      n *= pow(noise(vec2(seed * 194.0 + ang * amnt + t + cos(alpha * 2.0 * n + t * 1.1 + ang) * 2.8, seed + t + ang) + alpha), 1.0);
      n *= pow(noise(vec2(seed * 134.0 + ang * amnt + t + cos(alpha * 2.2 * n + t * 1.1 + ang) * 1.1, seed + t + ang) + alpha), 3.0);
      n *= pow(noise(vec2(seed * 123.0 + ang * amnt + t + cos(alpha * 2.3 * n + t * 1.1 + ang) * 0.8, seed + t + ang) + alpha), 4.0);
      n *= pow(alpha, 1.6);
      n *= (ang + PI) / 1.0 * (TWO_PI - ang - PI);
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