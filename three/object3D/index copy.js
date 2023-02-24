import * as THREE from '../three/build/three.module.js'
import {MeOrbitControls} from './MeOrbitControls.js'
// import { firstPersonalControl } from './FirstPersonalControl.js'
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
    camera.position.set(500,500,1500)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 窗口大小更改
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth,window.innerHeight)
    }
    window.addEventListener('resize',resize)

    let grid = new THREE.GridHelper(1000,50,'red','blue')
    // scene.add(grid)

    scene.add(new THREE.AxesHelper(1000))


    let geo = new THREE.BoxGeometry(20,20,20)
    let mat = new THREE.MeshBasicMaterial({color:'#000'})
    let box = new THREE.Mesh(geo,mat)
    box.position.y = 20
    box.position.x = -100
    scene.add(box)

    let redgeo = new THREE.BoxGeometry(20,20,20)
    let redmat = new THREE.MeshBasicMaterial({color:'red'})
    let redbox = new THREE.Mesh(redgeo,redmat)
    redbox.position.y = 20
    redbox.position.x = 0
    scene.add(redbox)

    let greengeo = new THREE.BoxGeometry(20,20,20)
    let greenmat = new THREE.MeshBasicMaterial({color:'green'})
    let greenbox = new THREE.Mesh(greengeo,greenmat)
    greenbox.position.y = 200
    greenbox.position.x = 100
    scene.add(greenbox)

    let fffgeo = new THREE.BoxGeometry(20,20,20)
    let fffmat = new THREE.MeshBasicMaterial({color:'#fff'})
    let fffbox = new THREE.Mesh(fffgeo,fffmat)
    fffbox.position.y = 20
    fffbox.position.x = 400
    fffbox.position.z = 400
    scene.add(fffbox)

 

    let geop = new THREE.PlaneGeometry(1000,1000)
    let matp = new THREE.MeshBasicMaterial({color:'#DFAD8C',side:THREE.DoubleSide})

    let plane = new THREE.Mesh(geop,matp)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    // 控制器
    // let control = new MeOrbitControls(camera,scene,renderer.domElement)
    // control.target = new THREE.Vector3(0,0,0)

    // let control = new firstPersonalControl(camera,scene,renderer.domElement)


    // 构建新的3d对象获取新坐标系
    let obj3D = new THREE.Object3D()

    let ax = new THREE.AxesHelper(1000)
    obj3D.add(ax)
    scene.add(obj3D)


    let mouseDownX,mouseDownY,
    target = new THREE.Vector3(100,0,0),
    rotationCenter = target.clone()

    
    camera.lookAt(target)

    obj3D.position.copy(rotationCenter)

    // 获取相机在加入obj3D之前的世界坐标
    let beforeObj3DWorldPosition = camera.position.clone()
    obj3D.add(camera)

    // 相机的世界坐标等于相机的本地坐标加上父级坐标
    camera.position.sub(obj3D.position)


    {

        let dom = renderer.domElement,Type = 'none'

        dom.onmousedown = function(e){

            if ( e.button == 0 ) Type = "rotation"
            if ( e.button == 2 ) Type = "pan"

            mouseDownX = e.clientX
            mouseDownY = e.clientY

            let raycaster = new THREE.Raycaster(),mouse = new THREE.Vector2()

            mouse.x = ( mouseDownX / window.innerWidth ) * 2 - 1
            mouse.y = - ( mouseDownY / window.innerHeight ) * 2 + 1

            raycaster.setFromCamera( mouse, camera )

            let targets = raycaster.intersectObjects(scene.children,true)

            if (targets[0].point) {

                rotationCenter = targets[0].point
                obj3D.position.copy(rotationCenter)

                // 相机的世界坐标等于相机局部坐标加obj3D的坐标
                camera.position.copy(beforeObj3DWorldPosition.clone().sub(obj3D.position.clone()))

            } else {

                throw new Error('当前未点击到任何Mesh对象')

            }

            dom.onmousemove = function(e){

                // 设置theta
                let theta = ( e.clientX - mouseDownX ) / window.innerWidth * Math.PI * 3
                let phi = ( e.clientY - mouseDownY ) / window.innerHeight * Math.PI

                if( Type == 'rotation' ) {

                    let matrix = new THREE.Matrix4()
                    // 定义初始旋转轴
                    let rotationX = new THREE.Vector3(1,0,0)
                    // 相机偏移
                    let offset = new THREE.Vector3(),
                    spherical = new THREE.Spherical()

                    // 计算当前相机的theta
                    offset.copy(beforeObj3DWorldPosition.clone().sub(rotationCenter.clone()))
                    spherical.setFromVector3(offset)
                    let cameraTheta = spherical.theta

                    // 方法一    以旋转中心为圆心，与target和相机位置为半径构建两个球坐标系，分别求出theta，补足差值 
                    offset.copy(rotationCenter.clone().sub(beforeObj3DWorldPosition.clone()))
                    spherical.setFromVector3(offset)
                    let theta1 = spherical.theta

                    offset.copy(target.clone().sub(beforeObj3DWorldPosition.clone()))
                    spherical.setFromVector3(offset)
                    let theta2 = spherical.theta

                    // 将旋转轴X进行同样的偏移
                    spherical.setFromVector3(rotationX)
                    // 球坐标系从z轴正半轴开始，向x正半轴为正，负半轴为负，数值为PI
                    spherical.theta += cameraTheta

                    // 弥补视线方向不同造成的误差
                    spherical.theta -= ( theta1 - theta2 )

                    rotationX.setFromSpherical(spherical)

                    // 方法二  根据向量夹角补足视角差,缺点，角度没有正负，需要自己判断
                    // 焦点和旋转中心之间的视角差值补齐
                    // let a = new THREE.Vector3(beforeObj3DWorldPosition.clone().x,0,beforeObj3DWorldPosition.clone().z)
                    // let b = new THREE.Vector3(rotationCenter.clone().x,0,rotationCenter.clone().z)
                    // let c = new THREE.Vector3(target.clone().x,0,target.clone().z)
                    // let cToT = a.clone().sub(c.clone())
                    // let cToR = a.clone().sub(b.clone())
                    // let angle = cToT.angleTo(cToR)

                    // if( rotationCenter.z < 0 ) angle = -angle

                    // matrix.makeRotationAxis(new THREE.Vector3(0,1,0),angle)
                    // rotationX.applyMatrix4(matrix)
                    // matrix.identity()
                    

                    // 限制phi的旋转角度
                    // let a = Math.abs(beforeObj3DWorldPosition.clone().y) / beforeObj3DWorldPosition.clone().length()

                    // 开始旋转
                    rotationX.normalize()
                    matrix.makeRotationAxis(rotationX,-phi)
                    camera.applyMatrix4(matrix)
                    matrix.identity()

                    // y轴为旋转轴
                    matrix.makeRotationY(-theta)
                    camera.applyMatrix4(matrix)

                }
                else if( Type == 'pan' ) {

                    let panX = (e.clientX - mouseDownX) * 0.5
                    let panY = (e.clientY - mouseDownY) * 0.5

                    let normal = new THREE.Vector3()

                    normal.setFromMatrixColumn(camera.matrix,0)
                    normal.multiplyScalar( - panX );
                    
                    target.add(normal)

                    camera.position.add(normal)

                    normal.setFromMatrixColumn(camera.matrix,1)
                    normal.multiplyScalar( panY );

                    target.add(normal)

                    camera.position.add(normal)

                }
                

                // 控制移动为线性运动
                mouseDownX = e.clientX
                mouseDownY = e.clientY

                beforeObj3DWorldPosition = camera.position.clone().add(obj3D.position.clone())


            }

            dom.onmouseup = function(){

                dom.onmousemove = null

            }

        }

        dom.oncontextmenu = function(e){ e.preventDefault() }


        // 滚轮缩放
        dom.onwheel = function(e){
            e.preventDefault()

            if(e.wheelDelta > 0) {

                let offset = new THREE.Vector3(),spherical = new THREE.Spherical()

                offset.copy(beforeObj3DWorldPosition.clone().sub(rotationCenter.clone()))

                spherical.setFromVector3(offset)
                spherical.radius /= 1.1

                offset.setFromSpherical(spherical)

                camera.position.copy(new THREE.Vector3()).add(offset)


            } else {

                let offset = new THREE.Vector3(),spherical = new THREE.Spherical()

                offset.copy(beforeObj3DWorldPosition.clone().sub(rotationCenter.clone()))

                spherical.setFromVector3(offset)
                spherical.radius *= 1.1

                offset.setFromSpherical(spherical)

                camera.position.copy(new THREE.Vector3()).add(offset)

            }

            beforeObj3DWorldPosition = camera.position.clone().add(obj3D.position.clone())

        }

    }






    // 渲染场景
    
    function render(){
        // control.update()
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}