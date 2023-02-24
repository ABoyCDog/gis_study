import * as THREE from '../three/build/three.module.js'
import {AtWillOrbitControls} from '../AtWillOrbitControls.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#fff', 0, 10000);

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#355527")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(0,500,1000)

    // 控制器
    let control = new AtWillOrbitControls(camera,scene,renderer.domElement)

    let grid = new THREE.GridHelper(1000,10,'orange')
    // scene.add( grid )

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    // 创建矩形
    {

        let video = document.querySelector('video')
        video.addEventListener('canplay',() => video.play())
        
        let videoMap = new THREE.VideoTexture( video )

        let mat = new THREE.MeshBasicMaterial({

            map:videoMap,
            side:THREE.DoubleSide

        })

        // 创建平面
        let geo = new THREE.PlaneGeometry(1000,1000)

        let plane = new THREE.Mesh( geo, mat )
        plane.rotation.x = Math.PI / -2
        scene.add(plane)

        let arr = new Float32Array([
            0,1,
            0.5,1,
            0,0.5,
            0.5,0.5
        ])
        let arr1 = new Float32Array([
            0.5,1,
            1,1,
            0.5,0.5,
            1,0.5
        ])
        let arr2 = new Float32Array([
            0,0.5,
            0.5,0.5,
            0,0,
            0.5,0
        ])
        let arr3 = new Float32Array([
            0.5,0.5,
            1,0.5,
            0.5,0,
            1,0
        ])

        let arrAll = [arr,arr1,arr2,arr3]
        let X = [-100, 0, -100,0]
        let Y = [100, 100, 0,0]

        for(let i=1; i<=4; i++) {

            let geo = new THREE.PlaneBufferGeometry(80,80)

            geo.setAttribute('uv',new THREE.BufferAttribute(arrAll[i - 1], 2))

            let plane = new THREE.Mesh( geo, mat )
            plane.position.setX( X[i-1] )
            plane.position.setY( Y[i-1] + 40 )

            scene.add( plane )

        }
        

    }


    // 渲染场景
    function render(){
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}