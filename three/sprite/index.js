import * as THREE from '../three/build/three.module.js'
import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    // scene.fog = new THREE.Fog('#fff', 0, 10000);

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("black")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(0,300,600)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 添加坐标轴
    // let axes = new THREE.AxesHelper(100)
    // scene.add(axes)

    // let gridHelper = new THREE.GridHelper( 1000, 100,'#2f3542' );
    // scene.add( gridHelper );

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient);

    // 创建20 * 20矩阵精灵图案===使用sprite
    // (function (){
    //     let spriteMat = new THREE.SpriteMaterial({color:'red'})
    //     for (let i = 0;i<20;i++){
    //         for(let j = 0;j<20;j++){
    //             let sprite = new THREE.Sprite(spriteMat)
    //             sprite.position.x = (j - 10) * 10
    //             sprite.position.y = (i - 10) * 10
    //             scene.add(sprite)
    //         }
    //     }
    // })()
    // 创建sprite===使用point
    let sprite
    (function (){
        let snowTexture = new THREE.TextureLoader().load('../images/snow.png')
        let spriteGeo = new THREE.Geometry()
        let spriteMat = new THREE.PointsMaterial({
            color:'white',
            // vertexColors:true,
            size:10,
            map:snowTexture,
            sizeAttenuation:true,
            transparent:true,
            opacity:1
        })
        for (let i = 0;i<50;i++){
            for(let j = 0;j<50;j++){
                let vertice = new THREE.Vector3(Math.random() * 1000 -500,Math.random() * 1000-500,Math.random() * 1000-500)
                spriteGeo.vertices.push(vertice)
                spriteGeo.colors.push(new THREE.Color(Math.random() * 0xffffff))
            }
        }
        sprite = new THREE.Points(spriteGeo,spriteMat)
        scene.add(sprite)
    })()
    let speed = 0
    function rotate(){
        speed += 0.001
        sprite.rotation.x = speed
    }

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
    function render(){
        rotate()
        control.update()
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}