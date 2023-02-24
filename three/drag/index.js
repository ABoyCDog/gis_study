import * as THREE from '../three/build/three.module.js'
import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
import {DragControls} from '../three/examples/jsm/controls/DragControls.js'
import {TrackballControls} from '../three/examples/jsm/controls/TrackballControls.js'
import {TransformControls, TransformControlsGizmo, TransformControlsPlane} from '../three/examples/jsm/controls/TransformControls.js'
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
    camera.position.set(0,200,300)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 添加坐标轴
    // let axes = new THREE.AxesHelper(100)
    // scene.add(axes)

    let gridHelper = new THREE.GridHelper( 1000, 100,'#2f3542' );
    scene.add( gridHelper );

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient)

    // 创建球体
    let cubeGeo = new THREE.BoxGeometry(10,10,10)
    let cubeMat = new THREE.MeshBasicMaterial({color:'#f7b731'})
    let cube = new THREE.Mesh(cubeGeo,cubeMat)
    cube.position.y = 5
    scene.add(cube)

    // 创建球体
    let cubeGeo1 = new THREE.BoxGeometry(10,10,10)
    let cubeMat1 = new THREE.MeshBasicMaterial({color:'#f7b731'})
    let cube1 = new THREE.Mesh(cubeGeo1,cubeMat1)
    cube1.position.y = 5
    cube1.position.x = 20
    scene.add(cube1)

    // 控制器
    let control = new OrbitControls(camera,renderer.domElement)
    control.enableDamping = true;

    // 射线获取对象
    let obj
    function rayObj(){
        // 通过射线查询获取场景中的对象、再将对象赋给控制器
        let raycaster = new THREE.Raycaster()
        let mouse = new THREE.Vector2()
        let intersects
        function getObj(event){
            // 坐标归一化
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
            raycaster.setFromCamera(mouse,camera)
            // 获取对象
            intersects = raycaster.intersectObjects(scene.children)
            if(intersects && intersects.length>0) obj = intersects[0].object
        }
        document.addEventListener('click',getObj)
    }
    rayObj()

    // 平移、旋转、缩放
    function transformObj(){
        let isControl = true
        control.enabled = isControl
        let TransformControl = new TransformControls(camera,renderer.domElement)
        TransformControl.attach(obj)
        TransformControl.setMode('translate')
        scene.add(TransformControl)
        // TransformControl.showX = false
        // TransformControl.showY = false
        TransformControl.addEventListener('dragging-changed',(event)=>{
            control.enabled = !event.value
        })
    }
    document.querySelector('#openTransform').addEventListener('click',()=>{
        if (obj !== undefined) transformObj()
        else alert('请选择编辑对象')
    })

    // 拖拽
    function drag(){
        let objs = []
        let color
        scene.children.forEach(item =>{
            if (item.isMesh) objs.push(item)
        })
        let dragControl = new DragControls(objs,camera,renderer.domElement)
        dragControl.addEventListener('hoveron',function(event){
            control.enabled = false
            color = event.object.material.color
            event.object.material.color = new THREE.Color('red')
        })
        dragControl.addEventListener('hoveroff',function(event){
            control.enabled = true
            event.object.material.color = new THREE.Color(color)
        })
        dragControl.addEventListener( 'dragstart', function ( event ) {
            event.object.material.color = new THREE.Color('red')
        } );
        dragControl.addEventListener( 'dragend', function ( event ) {
            control.enabled = true
            event.object.material.color = new THREE.Color(color)
        } );
    }
    drag()


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