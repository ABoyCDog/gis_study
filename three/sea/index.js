import * as THREE from '../three/build/three.module.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#fff', 0, 10000);

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#a4b0be")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,2000)
    camera.position.set(0,0,360)

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient)

    // 传递给着色器的uniform参数
    var uniforms = {
        iTime: { value: 1.0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth * 1.0, window.innerHeight * 1.0)},
        iMouse: { value: new THREE.Vector2(0.0, 0.0) }
    }
    // 材质
    var material = new THREE.ShaderMaterial( {
        // 着色器 uniform 参数
        uniforms: uniforms,
        // 顶点着色器文本内容
        vertexShader: `
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        // 片元着色器文本内容
        fragmentShader: `
        // 时间
        uniform float iTime;
        // 分辨率
        uniform vec2 iResolution;
        // 鼠标位置
        uniform vec2 iMouse;

        const int NUM_STEPS = 8;
        const float PI      = 3.141592;
        const float EPSILON = 1e-3;
        #define EPSILON_NRM (0.1 / iResolution.x)
        // sea
        const int ITER_GEOMETRY = 3;
        const int ITER_FRAGMENT = 5;
        const float SEA_HEIGHT = 0.6;
        const float SEA_CHOPPY = 4.0;
        const float SEA_SPEED = 0.8;
        const float SEA_FREQ = 0.16;
        const vec3 SEA_BASE = vec3(0.1,0.19,0.22);
        const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
        #define SEA_TIME (1.0 + iTime * SEA_SPEED)
        const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);
        
        // math
        mat3 fromEuler(vec3 ang) {
            vec2 a1 = vec2(sin(ang.x),cos(ang.x));
            vec2 a2 = vec2(sin(ang.y),cos(ang.y));
            vec2 a3 = vec2(sin(ang.z),cos(ang.z));
            mat3 m;
            m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
            m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
            m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
            return m;
        }
        float hash( vec2 p ) {
            float h = dot(p,vec2(127.1,311.7)); 
            return fract(sin(h)*43758.5453123);
        }
        float noise( in vec2 p ) {
            vec2 i = floor( p );
            vec2 f = fract( p );    
            vec2 u = f*f*(3.0-2.0*f);
            return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                             hash( i + vec2(1.0,0.0) ), u.x),
                        mix( hash( i + vec2(0.0,1.0) ), 
                             hash( i + vec2(1.0,1.0) ), u.x), u.y);
        }
        
        // lighting
        float diffuse(vec3 n,vec3 l,float p) {
            return pow(dot(n,l) * 0.4 + 0.6,p);
        }
        float specular(vec3 n,vec3 l,vec3 e,float s) {    
            float nrm = (s + 8.0) / (PI * 8.0);
            return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
        }
        
        // sky
        vec3 getSkyColor(vec3 e) {
            e.y = max(e.y,0.0);
            return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
        }
        
        // sea
        float sea_octave(vec2 uv, float choppy) {
            uv += noise(uv);        
            vec2 wv = 1.0-abs(sin(uv));
            vec2 swv = abs(cos(uv));    
            wv = mix(wv,swv,wv);
            return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
        }
        
        float map(vec3 p) {
            float freq = SEA_FREQ;
            float amp = SEA_HEIGHT;
            float choppy = SEA_CHOPPY;
            vec2 uv = p.xz; uv.x *= 0.75;
        
            float d, h = 0.0;    
            for(int i = 0; i < ITER_GEOMETRY; i++) {        
                d = sea_octave((uv+SEA_TIME)*freq,choppy);
                d += sea_octave((uv-SEA_TIME)*freq,choppy);
                h += d * amp;        
                uv *= octave_m; freq *= 1.9; amp *= 0.22;
                choppy = mix(choppy,1.0,0.2);
            }
            return p.y - h;
        }
        
        float map_detailed(vec3 p) {
            float freq = SEA_FREQ;
            float amp = SEA_HEIGHT;
            float choppy = SEA_CHOPPY;
            vec2 uv = p.xz; uv.x *= 0.75;
        
            float d, h = 0.0;    
            for(int i = 0; i < ITER_FRAGMENT; i++) {        
                d = sea_octave((uv+SEA_TIME)*freq,choppy);
                d += sea_octave((uv-SEA_TIME)*freq,choppy);
                h += d * amp;        
                uv *= octave_m; freq *= 1.9; amp *= 0.22;
                choppy = mix(choppy,1.0,0.2);
            }
            return p.y - h;
        }
        
        vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {  
            float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
            fresnel = pow(fresnel,3.0) * 0.65;
        
            vec3 reflected = getSkyColor(reflect(eye,n));    
            vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12; 
        
            vec3 color = mix(refracted,reflected,fresnel);
        
            float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
            color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
        
            color += vec3(specular(n,l,eye,60.0));
        
            return color;
        }
        
        // tracing
        vec3 getNormal(vec3 p, float eps) {
            vec3 n;
            n.y = map_detailed(p);    
            n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
            n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
            n.y = eps;
            return normalize(n);
        }
        
        float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {  
            float tm = 0.0;
            float tx = 1000.0;    
            float hx = map(ori + dir * tx);
            if(hx > 0.0) return tx;   
            float hm = map(ori + dir * tm);    
            float tmid = 0.0;
            for(int i = 0; i < NUM_STEPS; i++) {
                tmid = mix(tm,tx, hm/(hm-hx));                   
                p = ori + dir * tmid;                   
                float hmid = map(p);
                if(hmid < 0.0) {
                    tx = tmid;
                    hx = hmid;
                } else {
                    tm = tmid;
                    hm = hmid;
                }
            }
            return tmid;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            uv = uv * 2.0 - 1.0;
        uv.x *= iResolution.x / iResolution.y;    
        float time = iTime * 0.3 + iMouse.x*0.001;

        // ray
        vec3 ang = vec3(sin(time*3.0)*0.1,sin(time)*0.2+0.3,time);    
        vec3 ori = vec3(0.0,3.5,time*5.0);
        vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.15;
        dir = normalize(dir) * fromEuler(ang);

        // tracing
        vec3 p;
        heightMapTracing(ori,dir,p);
        vec3 dist = p - ori;
        vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
        vec3 light = normalize(vec3(0.0,1.0,0.8)); 

        // color
        vec3 color = mix(
            getSkyColor(dir),
            getSeaColor(p,n,light,dir,dist),
            pow(smoothstep(0.0,-0.05,dir.y),0.3));
                // post
                gl_FragColor = vec4(pow(color,vec3(0.75)), 1.0);
            }
        `
    });
    // 平面几何体
    var geom = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
    // 网格对象
    var mesh = new THREE.Mesh( geom, material );
    scene.add(mesh);

    /* 利用requestAnimationFrame实现动画 */
    var clock = new THREE.Clock(); // 时钟
    function animate() {
        requestAnimationFrame( animate );

        var delta = clock.getDelta(); // 获取本次和上次的时间间隔
        uniforms.iTime.value += delta; // 设置着色器使用的 iTime 参数
        renderer.render( scene, camera ); // 重新渲染
    }
    animate()

    // /* 监听鼠标移动，并改变着色器使用的 iMouse 参数 */
    var mouseStartPosition = null; // 鼠标起始位置
    // window.addEventListener("mousemove", function (event) {
    //     if (!mouseStartPosition) {
    //         mouseStartPosition = {x: event.clientX, y: event.clientY}
    //     } else {
    //         uniforms.iMouse.value.x = event.clientX - mouseStartPosition.x;
    //         uniforms.iMouse.value.y = event.clientY - mouseStartPosition.y;
    //     }
    // })


    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix = true
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    // 渲染场景
    function render(){
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}