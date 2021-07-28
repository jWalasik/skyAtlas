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