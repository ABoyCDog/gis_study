import * as THREE from '../three/build/three.module.js'
import {AtWillOrbitControls} from '../AtWillOrbitControls.js'
import { firstPersonalControl } from '../object3D/FirstPersonalControl.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#f5ad47")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,1000000)
    camera.position.set(0,100,300)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 控制器
    // let control = new OrbitControls(camera,scene,renderer.domElement)
    let firstControls = new firstPersonalControl(camera,scene, renderer.domElement)
    firstControls.Collision = false

    camera.quaternion.set(-0.03256516366072603,0.946319720312559,0.10092719233178407,0.30533948141590417)

    // 创建盒子的六个面材质贴图
    let arr = ['00.png', '01.png', '02.png', '03.png', '04.png', '05.png',]
    let materials = []
    let textureLoader = new THREE.TextureLoader()

    for(let i=0; i<6; i++) {
        
        let map = textureLoader.load('../cubecamera展馆图片/一号展馆/' + arr[i] )

        // if(i == 0) map = null
        let mat = new THREE.MeshBasicMaterial({
            map:map,
            side:THREE.DoubleSide
        })

        materials.push(mat)

    }
    const geo = new THREE.BoxGeometry(5000,5000,5000)

    const cube = new THREE.Mesh( geo, materials)

    scene.add( cube )

    console.log(cube)

    // 点击切换场景

    let switchGallery = document.querySelectorAll('.show span')

    switchGallery.forEach((item)=>{

        item.addEventListener('click',function(){
     
            materials = []

            for(let i=0; i<6; i++) {
        
                cube.material[i].map = textureLoader.load(`../cubecamera展馆图片/${item.dataset.name}号展馆/` + arr[i] )
        
            }

            switch(item.dataset.name){

                case '零': camera.position.set(-543.9653520370316,100,-44.36864353605676)
                camera.quaternion.set(-0.05048425155450241,-0.3263904231013709,-0.01746015672630058,0.9437244168610787)
                break;
                case '一': camera.position.set(0,100,300)
                camera.quaternion.set(-0.03256516366072603,0.946319720312559,0.10092719233178407,0.30533948141590417)
                break;
                case '二': camera.position.set(0,100,300)
                camera.quaternion.set(-0.06940196064323491,0.5879149621130975, 0.05072773868121603, 0.8043420054371899)
                break;
                case '三': camera.position.set(11.412530803209968,100,1229.929988798996)
                camera.quaternion.set(-0.04046487849938763,0.006130858933464291,0.000248292500852522,0.9991621212433954)
                break;
                case '四': camera.position.set(-833.005714209748,100,344.19997381076405)
                camera.quaternion.set(-0.007730081937468576,-0.5767852584843141,-0.005458341724897457,0.8168409991755049)
                break;
                case '五': camera.position.set(-732.3921629006968,100,-110.96627630598934)
                camera.quaternion.set(-0.01906315570088093,-0.9318271903462816,-0.049479641635842404,0.35900758834552143)
                break;

            }

        })

    })


    // 窗口大小更改
    function resize(){

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)

    }
    window.addEventListener('resize',resize)

    // 渲染场景
    function render(){

        firstControls.update()
        renderer.render(scene,camera)
        requestAnimationFrame(render)

    }
    render()
}