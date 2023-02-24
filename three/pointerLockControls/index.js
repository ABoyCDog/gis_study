import * as THREE from '../three/build/three.module.js'
import {PointerLockControls} from '../three/examples/jsm/controls/PointerLockControls.js'
// import { OBB } from './jsm/math/OBB.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog('#fff', 0, 750);

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#a4b0be")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.y = 10

    // 添加灯光
    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    // 创建地面
    let planeGeo = new THREE.PlaneGeometry(2000,2000,100,100)
    const planeMat = new THREE.MeshBasicMaterial( { color:'#26de81' } );
    let plane = new THREE.Mesh(planeGeo,planeMat)
    plane.rotateX(-Math.PI / 2)
    scene.add(plane)

    // 创建盒子
    let objs = []
    let boxColor = new THREE.Color(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75)
    let boxGeo = new THREE.BoxGeometry(10,10,10,20,20,20)
    let boxMat = new THREE.MeshLambertMaterial({color:'#2bcbba'})
    for (let i=0;i<500;i++){
        let box = new THREE.Mesh(boxGeo,boxMat)
        boxMat.color = boxColor
        box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
        box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
        box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
        objs.push(box)
        scene.add(box)
    }

    const PointerLockControl = new PointerLockControls( camera, document.body );
    // 理解为场景中移动的人物，第一人称
    let controlObj = PointerLockControl.getObject()
    controlObj.position.z = 300
    scene.add(controlObj);
    console.log(PointerLockControl)
    let clickStart = document.querySelector('#control')
    clickStart.addEventListener('click',function(){
        PointerLockControl.lock()
    })
    PointerLockControl.addEventListener( 'lock', function () {
        clickStart.style.display = 'none';
    } );
    PointerLockControl.addEventListener( 'unlock', function () {
        clickStart.style.display = 'block';
    } );

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let canJump = false;
    // 速度
    let velocity = new THREE.Vector3()
    // 控制方向
    let direction = new THREE.Vector3()
    const onKeyDown = function ( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
            case 'Space':
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;
        }
    };

    const onKeyUp = function ( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };
    document.addEventListener('keydown',onKeyDown)
    document.addEventListener('keyup',onKeyUp)

    let clock = new THREE.Clock()
    function Animation(){
        // 获取时间间隔
        let delta = clock.getDelta()
        if(PointerLockControl.isLocked === true){
            // 初始化速度
            velocity.x -= velocity.x * 10 * delta;
            velocity.z -= velocity.z * 8 * delta;
            // 判断移动方向
            direction.z = (+moveForward) - (+moveBackward)
            direction.x = (+moveLeft) - (+moveRight)
            // 向量归一化
            direction.normalize()
            if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
            PointerLockControl.moveRight( velocity.x * delta );
            if ( moveLeft || moveRight ) velocity.x -= direction.x * 1600.0 * delta;
            PointerLockControl.moveForward( - velocity.z * delta );
            // 上下跳跃
            velocity.y -= 9.8 * 100.0 * delta;
            controlObj.position.y += ( velocity.y * delta )
            if ( controlObj.position.y < 10 ) {
                velocity.y = 0;
                controlObj.position.y = 10;
                canJump = true;
            }
        }
    }
    

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    // 渲染场景
    function render(){
        requestAnimationFrame(render)
        Animation()
        renderer.render(scene,camera)
    }
    render()
}