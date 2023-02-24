import * as THREE from '../three/build/three.module.js'
import {AtWillOrbitControls} from './AtWillOrbitControls.js'
import { firstPersonalControl } from './FirstPersonalControl.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    // scene.fog = new THREE.Fog('#fff', 0, 10000);

    var CubeLoader = new THREE.CubeTextureLoader();
    CubeLoader.setPath( '../images/' )
    let type = '.jpg'
    var skyTexture = CubeLoader.load( [
        'posx' + type,'negx' + type,
        'posy' + type,'negy' + type,
        'posz' + type,'negz' + type,
    ] );
    // scene.background = skyTexture

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    // renderer.setClearColor("#f5ad47")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,100000)
    camera.position.set(0,100,-1500)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // let control = new AtWillOrbitControls(camera, scene, renderer.domElement)

    // control.dispose()
    // control.target = new THREE.Vector3(0,0,0)
    // control.update()
    // control.mapControls = true
    // control.rotationSpeedTheta = 1

    // console.log(control)

    let control = new firstPersonalControl(camera, scene,renderer.domElement)

    control.forwardSpeed = 300
    // control.Collision = true
    control.CollisionDistance = 100
    // control.enableDamping = false


    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    let grid = new THREE.GridHelper(1000,50,'red','blue')
    // scene.add(grid)

    // scene.add(new THREE.AxesHelper(1000))

{
    // 创建场景
    let geo = new THREE.BoxGeometry(100,100,100)

    for(let i=0; i<10; i++){

        for(let j=0; j<10; j++){

            let mat = new THREE.MeshBasicMaterial({

                color: new THREE.Color( 'rgb(' + Math.floor(Math.random()*200+20)+','+Math.floor(Math.random()*200+10)+','+Math.floor(Math.random()*100+40) +')' )

            })

            let box = new THREE.Mesh( geo, mat )

            box.position.set(Math.random()*i*1000 - 1000, Math.random()*10+50,Math.random()*j*1000)
            scene.add(box)

        }

    }

    let planeG = new THREE.PlaneGeometry(10000,10000)
    let mat = new THREE.MeshBasicMaterial({color:'#f5ad47'})

    let plane = new THREE.Mesh(planeG, mat)
    plane.rotation.x = - Math.PI / 2

    scene.add(plane)
}





    // 渲染场景
    
    function render(){

        control.update()

        renderer.render(scene,camera)
        requestAnimationFrame(render)

    }
    render()
}