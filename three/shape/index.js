import * as THREE from '../three/build/three.module.js'
import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
import { color } from '../three/examples/jsm/libs/dat.gui.module.js'
window.onload = function() {
    let shapePig,Dshape,DIYShape
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
    camera.position.set(0,100,300)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 添加坐标轴
    let axes = new THREE.AxesHelper(100)
    scene.add(axes)

    let gridHelper = new THREE.GridHelper( 1000, 100,'#2f3542' );
    scene.add( gridHelper );

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient)

    // 创建形状
    function shapeFun() {
        shapePig = new THREE.Shape()
        shapePig.moveTo(0,100)
        shapePig.lineTo(-20,80)
        shapePig.quadraticCurveTo(-25,70,-30,30)
        shapePig.moveTo(-20,60)
        shapePig.lineTo(-20,40)
        shapePig.moveTo(-10,60)
        shapePig.quadraticCurveTo(-20,65,-10,0)
        // shapePig.lineTo(-10,40)

        let hole = new THREE.Path()
        hole.arc(-15,77,3,0,Math.PI*2,false)
        shapePig.holes.push(hole)
    }
    shapeFun()
    // 创建形状
    DIYShape = new THREE.ShapeGeometry(shapePig)
    // 根据路径绘制线段
    // Dshape = new THREE.Line(shapePig.createPointsGeometry(10),new THREE.LineBasicMaterial({color:'red'}))

    let mat = new THREE.MeshBasicMaterial({ color:'#f5ad47',side:THREE.DoubleSide,vertexColors:true })
    Dshape = new THREE.Mesh(DIYShape,mat)
    scene.add(Dshape)


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
        control.update()
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}