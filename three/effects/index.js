import * as THREE from '../three/build/three.module.js'
import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
import {SceneUtils} from '../three/examples/jsm/utils/SceneUtils.js'
// 添加特效的基础组件
import { EffectComposer, Pass } from '../three/examples/jsm/postprocessing/EffectComposer.js'
import { MaskPass, ClearMaskPass } from '../three/examples/jsm/postprocessing/MaskPass.js'
import { RenderPass } from '../three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '../three/examples/jsm/postprocessing/ShaderPass.js'
import { CopyShader } from '../three/examples/jsm/shaders/CopyShader.js'
// 胶片效果
import { FilmPass } from '../three/examples/jsm/postprocessing/FilmPass.js'
import { FilmShader } from '../three/examples/jsm/shaders/FilmShader.js'
// 信号损坏风格
import { GlitchPass } from '../three/examples/jsm/postprocessing/GlitchPass.js'
// 泛光效果
import { BloomPass } from '../three/examples/jsm/postprocessing/BloomPass.js'


window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#000', 0, 10000);

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#000")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(0,30,50)
    camera.lookAt(scene.position)

    // 添加坐标轴
    // let axes = new THREE.AxesHelper(100)
    // scene.add(axes)

    let gridHelper = new THREE.GridHelper( 1000, 100,'#2f3542' );
    // scene.add( gridHelper );

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient)

    // 创建球体
    let sphere = createMesh(new THREE.SphereBufferGeometry(10,100,100))
    sphere.position.y = 10
    scene.add(sphere)
    camera.lookAt(sphere.position)

    function createMesh(geom) {
        var planetTexture = new THREE.TextureLoader().load("../images/Earth.png");
        var specularTexture = new THREE.TextureLoader().load("../images/EarthSpec.png");
        var normalTexture = new THREE.TextureLoader().load("../images/EarthNormal.png");
        var planetMaterial = new THREE.MeshPhongMaterial();
        planetMaterial.specularMap = specularTexture;
        planetMaterial.specular = new THREE.Color(0x4444aa);
        planetMaterial.normalMap = normalTexture;
        planetMaterial.map = planetTexture;
        var mesh = new THREE.Mesh(geom,planetMaterial);
        // var mesh = new SceneUtils.createMultiMaterialObject(geom, [planetMaterial]);
        return mesh;
    }

    // 定义效果渲染器
    let composer = new EffectComposer(renderer)
    // 定义渲染通道
    let renderPass = new RenderPass(scene,camera)
    // // 
    let effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = true;

    // 故障花纹
    // 输出到显示器===参数：noiseIntensity:屏幕颗粒程度,scanlinesIntensity:扫描线显著程度,scanlinesCount:扫描线数量,grayscale:灰度图
    let effectFilm = new FilmPass(0.5,0.2,128,true)
    console.log(effectFilm.uniforms)
    effectFilm.renderToScreen = true
    // 按顺序渲染
    composer.addPass(renderPass)
    composer.addPass(effectFilm)

    // 信号损坏风格
    // let Glitch = new GlitchPass(64)
    // Glitch.renderToScreen = true
    // composer.addPass(renderPass)
    // composer.addPass(Glitch)

    // 泛光效果==参数：strength:泛光强度，明亮处更明亮，且渗入暗处地方更多, kernelSize:泛光效果偏移量，
    //sigma:泛光锐利程度，越高越模糊,Resolution:泛光解析图，值过小导致方块化严重
    // let bloom = new BloomPass(3, 20, 3, 512)
    // composer.addPass(renderPass)
    // composer.addPass(bloom)
    // composer.addPass(effectCopy)


    // 控制器
    let control = new OrbitControls(camera,renderer.domElement)
    control.enableDamping = true;

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    // 渲染场景
    let clock = new THREE.Clock()
    function render(){
        let delta = clock.getDelta()
        control.update()
        composer.render(delta)
        requestAnimationFrame(render)
    }
    render()
}