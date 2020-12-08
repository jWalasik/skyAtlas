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
          c.a = alpha; //middle section trasnsparency
      }
       gl_FragColor = vec4(color, c.a);
    }