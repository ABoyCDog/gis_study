import * as THREE from '../three/build/three.module.js'
import {AtWillOrbitControls} from '../AtWillOrbitControls.js'
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
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(-50,30,50)
    camera.lookAt(new THREE.Vector3(0,0,0))

    let gridHelper = new THREE.GridHelper( 1000, 100,'#2f3542' );
    gridHelper.rotateY(Math.PI / 4)
    scene.add( gridHelper );

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient)

    // 创建球体
    let clock = new THREE.Clock()
    let uniforms = {
            u_time: { type: "f", value: 0.2 },
            u_resolution: { type: "v2", value: new THREE.Vector2() }
        }

    let cubeGeo = new THREE.BoxBufferGeometry(10,10,10)
    let cubeMat = new THREE.ShaderMaterial({
        uniforms:uniforms,
        vertexShader:document.querySelector('#vertexShader').textContent,
        fragmentShader:document.querySelector('#fragmentShader').textContent
    })
    let cube = new THREE.Mesh(cubeGeo,cubeMat)
    cube.position.y = 5
    scene.add(cube)

    // 控制器
    let control = new AtWillOrbitControls(camera,scene,renderer.domElement)

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
        uniforms.u_resolution.value.x = renderer.domElement.width;
        uniforms.u_resolution.value.y = renderer.domElement.height;
    }
    window.addEventListener('resize',resize)

    // 渲染场景
    function render(){
        
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}