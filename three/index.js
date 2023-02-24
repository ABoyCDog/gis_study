import * as THREE from '../three/build/three.module.js'
import {AtWillOrbitControls} from './object3D/AtWillOrbitControls.js'
import {firstPersonalControl} from './object3D/FirstPersonalControl.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#fff', 0, 10000);

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#f5ad47")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(0,100,300)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 控制器
    let control = new AtWillOrbitControls(camera,scene,renderer.domElement)

    let fpsControl = new firstPersonalControl(camera,scene,renderer.domElement)

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
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