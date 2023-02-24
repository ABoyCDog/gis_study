import * as THREE from '../three/build/three.module.js';
import Stats from '../three/examples/jsm/libs/stats.module.js'
import  { VISMLoader } from "../node_modules/@mesh-3d/mesh3d-engine/Source/renderable/model/VISMLoader.js";
window.THREE = THREE;
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer({antialias:true})
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#a4b0be")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 2048, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    // Create cube camera
    const cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
    

    scene.add( cubeCamera );

    scene.background = cubeRenderTarget.texture

    setTimeout(() => {
        camera.position.set(11.381793205338198, 2, -17.590821460384806)
        cubeCamera.position.copy(camera.position)

    }, 1000);
    camera.quaternion.set(-0.02297210769901612,-0.2891354074623773,-0.006940582422096388,0.9569873702066668)


    // 资源优化
    // 讲模型场景添加到数组方便进行碰撞检测
    let child = []
    function getChild(obj){
        if (obj.type === 'Group' || 'Scene') {
            obj.children.forEach(item => {
                if (item.type === 'Group') getChild(item)
                else {
                    item.frustumCulled = false
                    child.push(item)
                }
            })
        } else {
            obj.frustumCulled = false
            child.push(obj)
        }       
    }

    function frustumCulled(obj){
        if (obj.type === 'Group' || 'Scene') {
            obj.children.forEach(item => {
                if (item.type === 'Group') frustumCulled(item)
                else {
                    item.frustumCulled = true
                }
            })
        } else {
            obj.frustumCulled = true
        }       
    }

    let vismLoader = new VISMLoader()
    /*
    
    './model/ZGFile/zhanguan_01.vism', './model/ZGFile/zhanguan_02.vism', './model/ZGFile/zhanguan_03.vism', 
    './model/ZGFile/zhanguan_04.vism', './model/ZGFile/zhanguan_05.vism', './model/ZGFile/zhanguan_ding.vism', './model/ZGFile/zhanguan_zx.vism'

    */ 

    const vismList = [
    './model/ZGFile/zhanguan_zx.vism','./model/ZGFile/zhanguan_04.vism']
    vismList.forEach((vismUrl, vismUrlIndex) => {
        vismLoader.load(vismUrl, function(Ojb){
            let childrenList = Ojb.scene.children;
            
            childrenList.forEach((item, index) => {
                let map = item.material ? !item.material.aoMap && !item.material.lightMap : false; // 没有lightMap和aoMap属性
                let uv = item.geometry ? item.geometry.attributes.uv : null;
                let uv2 =  item.geometry ? item.geometry.attributes.uv2 : null; // 存在 uv2
                let uv3 = item.geometry ?  item.geometry.attributes.uv3 : null;
                let alphaMap = item.material ? item.material.alphaMap : null;
            
                if (map && uv2) {
                delete item.geometry.attributes.uv2;
                }
            
                if (uv3 && alphaMap === null) {
                delete item.geometry.uv3;
                }

            });
            scene.add(Ojb.scene)
            getChild(Ojb.scene)
        })
        
    })



    // 函数执行区
    var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
    var PI_2 = Math.PI / 2;
	var vec = new THREE.Vector3();
    let minPolarAngle = 0; // radians
	let maxPolarAngle = Math.PI; // radians
    function onMouseMove( event ) {
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		euler.setFromQuaternion( camera.quaternion );
		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;
		euler.x = Math.max( PI_2 - maxPolarAngle, Math.min( PI_2 - minPolarAngle, euler.x ) );
		camera.quaternion.setFromEuler( euler );
	}

    // 鼠标控制方向移动
    document.addEventListener('mousedown',function(event){
        event.preventDefault()
        if (event.button == 0) {
            document.onmousemove = onMouseMove
            document.onmouseup = () => document.onmousemove = null
        }
    })

    function moveForwardFun ( distance ) {
		vec.setFromMatrixColumn( camera.matrix, 0 );
		vec.crossVectors( camera.up, vec );
		camera.position.addScaledVector( vec, distance );
	};

	function moveRightFun ( distance ) {
		vec.setFromMatrixColumn( camera.matrix, 0 );
		camera.position.addScaledVector( vec, distance );
	};
    // 控制方向
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let jump = false;
    // 控制反复点击和长按空格
    let continuousJump = true
    let velocity = new THREE.Vector3()
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
                if(jump && continuousJump) velocity.y += 20
                jump = false;
                continuousJump = false;
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
            case 'Space':
                continuousJump = true;
                break;
        }
    };
    document.addEventListener('keydown',onKeyDown)
    document.addEventListener('keyup',onKeyUp)



    let clock = new THREE.Clock()
    // 点击右键自动寻路
    let mouse = new THREE.Vector2();
    let targets,pos
    document.addEventListener('contextmenu',function(event){
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( mouse, camera );
        targets = raycaster.intersectObjects(child)
        if (targets.length>0) {
            pos = targets[0].point.clone()
            if (pos.y <= 0.1) {
                pos.y = 2
                new TWEEN.Tween(camera.position).to(pos,1000).easing(TWEEN.Easing.Linear.None).start()
            }
        }
    })

    let rayDirection = new THREE.Vector3()
    function Animation(){
        let direction = new THREE.Vector3()
        // 获取时间间隔
        let delta = clock.getDelta()
        // 增加过渡速度，模拟惯性效果
        velocity.x -= velocity.x * 5 * delta;
        velocity.z -= velocity.z * 5 * delta;
        velocity.y -= 9.8 * 8 * delta; // 默认下降的速度
        // 判断移动方向
        direction.z = Number(moveForward) - Number(moveBackward)
        direction.x = Number(moveLeft) - Number(moveRight)
        // 向量归一化
        direction.normalize()
        // 碰撞检测、定义射线
        // 获取当前移动方向===增加判断，提高精确度
        var matrix = new THREE.Matrix4();
        if(direction.z > 0){
            if(direction.x > 0){
                matrix.makeRotationY(Math.PI/4);
            }
            else if(direction.x < 0){
                matrix.makeRotationY(-Math.PI/4);
            }
            else{
                matrix.makeRotationY(0);
            }
        }
        else if(direction.z < 0){
            if(direction.x > 0){
                matrix.makeRotationY(Math.PI/4*3);
            }
            else if(direction.x < 0){
                matrix.makeRotationY(-Math.PI/4*3);
            }
            else{
                matrix.makeRotationY(Math.PI);
            }
        }
        else{
            if(direction.x > 0){
                matrix.makeRotationY(Math.PI/2);
            }
            else if(direction.x < 0){
                matrix.makeRotationY(-Math.PI/2);
            }
        }
        rayDirection.copy(camera.getWorldDirection(new THREE.Vector3(0,0,0)).multiply(new THREE.Vector3(1, 0, 1)));
         //根据当前前进方向和相机偏移角度水平发射射线==获取运动方向
        rayDirection.applyMatrix4(matrix);

        // 防止穿过中间镂空的物体
        let rayPosition = camera.position.clone()
        let horiztialaster = new THREE.Raycaster(new THREE.Vector3(rayPosition.x,rayPosition.y - 1.5,rayPosition.z),rayDirection,0,1)
        let objs = horiztialaster.intersectObjects(child)
        // if (objs.length <= 0) {
            // 防止穿过底部悬空的物体
            let horiztialasterButtom = new THREE.Raycaster(new THREE.Vector3(rayPosition),rayDirection,0,1)
            let objsButtom = horiztialasterButtom.intersectObjects(child)
            // if( objsButtom.length <= 0 ){
                moveForwardFun( - velocity.z * delta );
                if ( moveForward || moveBackward ) {
                    velocity.z -= direction.z * 50 * delta;
                }
                moveRightFun( velocity.x * delta );
                if ( moveLeft || moveRight ) {
                    velocity.x -= direction.x * 50.0 * delta;
                }
            // }
            
        // }
        // 通过space跳跃
        // 作向上的碰撞检测防止跳跃穿过物体
        let upRaycaster = new THREE.Raycaster(rayPosition,new THREE.Vector3(0,1,0),0,0.5)
        let upObj = upRaycaster.intersectObjects(child)
        if ( upObj.length >0 ) {
            velocity.y = Math.min( 0, velocity.y );
            jump = true;
        }

        // 作向下的碰撞检测
        let downRaycaster = new THREE.Raycaster(rayPosition,new THREE.Vector3(0,-1,0),0,1)
        let downObj = downRaycaster.intersectObjects(child)
        if ( downObj.length >0 ) {
            velocity.y = Math.max( 0, velocity.y );
            jump = true;
        }
        // 限制向下的最低位置
        camera.position.y += ( velocity.y * delta )
        if ( camera.position.y <= 2 ) {
            velocity.y = 0;
            camera.position.y = 2;
            jump = true;
        }
    }

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    // 添加状态监听器
    const stats = new Stats()
    const initStats = function() {
        stats.setMode(0)
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.zIndex = '1000'
        stats.domElement.style.left = '10px';
        stats.domElement.style.top = '10px';
        document.body.appendChild(stats.domElement)
    }
    initStats()

    // 点击切换相机位置到各个展馆处
    document.querySelector('.theOne').addEventListener('click',function(){
        new TWEEN.Tween(camera.position).to(new THREE.Vector3(3.001969448320733, 2, -6.333833447687258),1000).easing(TWEEN.Easing.Linear.None).start()
        camera.quaternion.set(-0.02297210769901612,-0.2891354074623773,-0.006940582422096388,0.9569873702066668)
    })
    document.querySelector('.theTwo').addEventListener('click',function(){
        let tweenTwoB = new TWEEN.Tween(camera.position).to(new THREE.Vector3(2.348700043314313, 2, -1.9803850742355462,100)).easing(TWEEN.Easing.Linear.None)
        tweenTwoB.start()
        camera.quaternion.set(-0.010342265430300807,-0.7935175081274028,-0.013491097305580128,0.6083099474236288)
    })
    document.querySelector('.theThree').addEventListener('click',function(){
        new TWEEN.Tween(camera.position).to(new THREE.Vector3(-0.09352879652818262, 2, 1.055118343802988),1000).easing(TWEEN.Easing.Linear.None).start()
        camera.quaternion.set(-0.00018119777866074577,-0.9996404198076955,-0.0069975972331154076,0.025884974155337123)
    })
    document.querySelector('.theFour').addEventListener('click',function(){
        new TWEEN.Tween(camera.position).to(new THREE.Vector3(-3.8653664141521427, 2, -1.0796176897825107),1000).easing(TWEEN.Easing.Linear.None).start()
        camera.quaternion.set(-0.010558901239318417,0.8311893330331414,0.01579449797796252,0.5556647695240036)
    })
    document.querySelector('.theFive').addEventListener('click',function(){
        new TWEEN.Tween(camera.position).to(new THREE.Vector3( -1.9820076159769207, 2, -5.870350865776286),1000).easing(TWEEN.Easing.Linear.None).start()
        camera.quaternion.set(-0.020862650837735534,0.31706301921665025,0.0069765120030218335,0.94814931309658)
    })



    console.log(renderer)

    let num
    // 渲染场景
    function render(){
        Animation();
        renderer.render(scene,camera);
        stats.update();
        TWEEN.update();
        cubeCamera.update(renderer, scene )
        requestAnimationFrame(render)

        // console.log(renderer.renderLists.get(scene,camera).opaque.length)


    }
    render()
    console.log(renderer.getRenderList())

    
    // let interval = setInterval(() => {
    //     num = Math.ceil(renderer.renderLists.get(scene,camera).opaque.length / 951 * 100)
    //     document.querySelector('.mask span').textContent = num + '%'
    //     if (num == 100) {
    //         frustumCulled(scene)
            document.querySelector('.mask').style.display = 'none'
    //         clearInterval(interval)
    //     }
    // }, 0);

        // 设置canvas画布
        let canvas = document.createElement('canvas')
        canvas.height = 2048
        canvas.width = 2048
        canvas.style.display = 'none'
        canvas.top = 0
        canvas.left = 0
        let ctx = canvas.getContext('2d')
        let targetA = document.querySelector('.downLoad')

        // renderInstances


    targetA.addEventListener('dblclick',function(){
        for(let i=0; i<6; i++){
            // 创建buff存放像素数据
            const buffer = new Uint8Array(2048 * 2048 *4)
            const clamped = new Uint8ClampedArray(buffer.buffer);
        
            renderer.readRenderTargetPixels(cubeRenderTarget, 0, 0, 2048,2048, buffer,i);
        
            const imageData = new ImageData(clamped, 2048, 2048);
            
            // 将像素输出到canvas
            ctx.putImageData(imageData, 0, 0);
            // 将canvas画布内容保存为图片
            var img = canvas.toDataURL('image/png')
            targetA.href =img;
            targetA.download = `0${i}`
            targetA.click()
        }
    })
    

        
    
}