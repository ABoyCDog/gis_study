import * as THREE from './three/build/three.module.js'
import {OrbitControls} from './three/examples/jsm/controls/OrbitControls.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import {GUI} from './three/examples/jsm/libs/dat.gui.module.js'
import {SceneUtils} from './three/examples/jsm/utils/SceneUtils.js'
window.onload = function () {
    
//定义常用宽高
let width = window.innerWidth
let height = window.innerHeight

// 定义场景
let scene = new THREE.Scene()
// 将场景里面的所有物体材质都统一为规定的材质
// scene.overrideMaterial = new THREE.MeshLambertMaterial({color: '#2c2c54'});


// 增加雾化效果、颜色、开始地点、结束地点
// scene.fog = new THREE.Fog(0xffffff, 50, 2100);


// 定义相机
let camera = new THREE.PerspectiveCamera(45,width / height,0.1,3000)
camera.position.set(-500, 1000, 600); //设置相机位置
camera.lookAt(scene.position);

// 显示坐标轴
// let axes = new THREE.AxesHelper(1000)
// scene.add(axes)

// 定义渲染器
let renderer = new THREE.WebGLRenderer()
renderer.setSize(width,height)
renderer.setClearColor('#fff')

// 开启阴影
renderer.shadowMap.enabled = true
// 柔和阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// 添加环境光
let ambient = new THREE.AmbientLight('#fff',0.3);
scene.add(ambient);

// 添加点光源、不能将颜色设为字符串、不然gui无法解析，导致报错
let lightColor = 0xffffff
let spotLight = new THREE.SpotLight(lightColor,.7)
spotLight.position.set(1000,600,0)
// // 光照强度
// spotLight.intensity = 1
// // 关照强度是否会随距离变化而变化、0为不会变化
// spotLight.distance = 500
// 决定渲染阴影的像素多少、数值越大越平滑，默认512
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
// 开始产生阴影的位置
spotLight.shadow.camera.near = 50;
// 最远可以产生阴影的位置
spotLight.shadow.camera.far = 5000;
// 投影视场，表示用于生成阴影的视场大小
spotLight.shadow.camera.fov = 50;
spotLight.castShadow = true
scene.add(spotLight)

// 创建平面
let plane = new THREE.PlaneGeometry(1500,800)
let planeMat = new THREE.MeshLambertMaterial({color:'#2c3e50'})
let planeMesh = new THREE.Mesh(plane,planeMat)
planeMesh.rotation.x = -0.5 * Math.PI
planeMesh.position.x = 400
planeMesh.position.y = 0
planeMesh.position.z = 0
planeMesh.receiveShadow = true
// scene.add(planeMesh)

// 创建立方体平铺在平面上
function planeCube(){
    for (let i=0;i<30;i++){
        for(let j=0;j<16;j++){
            let color = Math.random() * 1.01;
            let LCubeGeom = new THREE.BoxGeometry(40,40,40)
            let LCubeMat = new THREE.MeshLambertMaterial()
            LCubeMat.color = new THREE.Color(1, 0, color)
            let LCube = new THREE.Mesh(LCubeGeom,LCubeMat)
            LCube.name = 'planeCube'
            LCube.position.x = i * 50 -330
            LCube.position.y = 25
            LCube.position.z = j * 50 - 380
            LCube.receiveShadow = true
            scene.add(LCube)
        }
    }
}
planeCube()

// 创建立体
let cube = new THREE.BoxGeometry(100,100,100)
let cubeMat = new THREE.MeshLambertMaterial({color:'#2980b9'})
let cubeMesh = new THREE.Mesh(cube,cubeMat)
cubeMesh.position.x = 800
cubeMesh.position.y = 150
cubeMesh.position.z = 0
cubeMesh.castShadow = true
scene.add(cubeMesh)

// 创建球体
let sphere = new THREE.SphereGeometry(100,100,100)
// 为球体创建多材质属性、两个材质属性会进行混合叠加
let sphereMat = [
    new THREE.MeshLambertMaterial({color:'#EAB543'}),
    // new THREE.MeshBasicMaterial({transparent:true,opacity:0.3,color:'#2980b9'}),
]
let sphereMesh = new SceneUtils.createMultiMaterialObject(sphere,sphereMat)
// 使用多材质属性构造的是几何体的集合所组成的一个组，所以不能直接对组进行操作，需要对其子集做操作
sphereMesh.children.forEach(function (e) {
    e.castShadow = true
});
sphereMesh.position.set(300,150,0)
// sphereMesh.castShadow = true
scene.add(sphereMesh)

// 创建与光源一起运动的小球体、充当可视光源
let sphereLightGeom = new THREE.SphereGeometry(10,100)
let sphereLightMat = new THREE.MeshBasicMaterial({color:'#ffaf40'})
let sphereLight = new THREE.Mesh(sphereLightGeom,sphereLightMat)
scene.add(sphereLight)

// 添加状态监听器
const stats = new Stats()
const initStats = function() {
    stats.setMode(1) // 0: fps, 1: ms
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.left = '10px';
    stats.domElement.style.top = '10px';
    document.body.appendChild(stats.domElement)
}
initStats()

// 增加gui界面控制
let length = scene.children.length
let X = 800
let isShowAmbient = true
const guiControl = new function(){
    // 添加物体
    this.addMesh = function(){
        let cubeSize = Math.random()*(100-50)+50
        let cubeGeo = new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize)
        let cubeMat = new THREE.MeshLambertMaterial({color: Math.random()*0xffffff})
        let cube = new THREE.Mesh(cubeGeo,cubeMat)
        cube.castShadow = true;
        // 1500是平面的长度，300是平面x轴负半轴的长度、50是避免立方体部分嵌入平面、800是平面宽、400是负半轴长度
        cube.position.set(1500 * Math.random() - 300,90 + 200 * Math.random(),800 * Math.random() - 400)
        scene.add(cube)
    }
    // 从后往前删除物体
    this.removeCube = function(){
        let targ = scene.children[scene.children.length - 1]
        if (targ instanceof THREE.Mesh && scene.children.length >length) scene.remove(targ)
        else alert('无可移除对象')
    }
    this.clone= function(){
        X += 10
        let time = new Date()
        time = cubeMesh.clone()
        time.position.x = X
        scene.add(time)
    }
    // 控制运动速度
    this.rotationSpeed = 0.02
    this.bouncingSpeed = 0.04
    // 移动立方体物体
    this.positionX = 800
    this.positionY = 100
    this.positionZ = 0
    // 控制立方体显示隐藏
    this.visible = true
    // 控制切换正交相机和透视相机
    this.cameraViewer = 'Perspective'
    this.switchCamera = function(){
        if (camera instanceof THREE.PerspectiveCamera){
            camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 5000)
            camera.position.set(-500, 1000, 600); //设置相机位置
            camera.lookAt(scene.position);
            this.cameraViewer = 'Orthographic'
            // 鼠标控制场景旋转
            var control = new OrbitControls(camera,renderer.domElement)
        } else {
            camera = new THREE.PerspectiveCamera(45,width / height,0.1,3000)
            camera.position.set(-500, 1000, 600); //设置相机位置
            camera.lookAt(scene.position);
            this.cameraViewer = 'Perspective'
            // 鼠标控制场景旋转
            var control = new OrbitControls(camera,renderer.domElement)
        }
    }
    // 关闭环境光
    this.closeAmbient = function(){
        isShowAmbient = !isShowAmbient
        ambient.visible = isShowAmbient
    }
    // 控制旋转光的颜色
    this.sphereLightColor = lightColor
    // 控制光源距离
    this.lightDistance = 0
    // 控制光源强度
    this.lightIntensity = 1
}
let gui = new GUI()
// 构建下拉菜单组
let Guiposition = gui.addFolder('position')
// 将位置控制项放进组中、同时绑定值，方便监听
let CPositionX = Guiposition.add(guiControl,'positionX',-300,1200)
let CPositionY = Guiposition.add(guiControl,'positionY',100,400)
let CPositionZ = Guiposition.add(guiControl,'positionZ',-400,400)
// 监听变化并动态修改值
let CPositionArr = [CPositionX,CPositionY,CPositionZ]
CPositionArr.forEach(function(item,index){
    item.listen()
    item.onChange(function(val){
        if (index == 0) cubeMesh.position.x = val
        else if (index == 1) cubeMesh.position.y = val
        else if (index == 2) cubeMesh.position.z = val
    })
})
gui.add(guiControl,'rotationSpeed',0,1)
gui.add(guiControl,'bouncingSpeed',0,1)
// 改变光源颜色、距离、强度
gui.addColor(guiControl,'sphereLightColor').onChange(function (e) {
    spotLight.color = new THREE.Color(e);
})
gui.add(guiControl,'lightDistance',500,2000).onChange(val => spotLight.distance = val)
gui.add(guiControl,'lightIntensity',0,3).onChange(val => spotLight.intensity = val)
// 控制立方体显示隐藏
let visible = gui.add(guiControl,'visible')
visible.listen()
visible.onChange(function(boolean){
    cubeMesh.visible = boolean
})
// 切换相机视角
gui.add(guiControl,'switchCamera')
// 监听视角改变
gui.add(guiControl,'cameraViewer').listen()
gui.add(guiControl,'addMesh')
gui.add(guiControl,'removeCube')
gui.add(guiControl,'clone')
// 关闭环境光
gui.add(guiControl,'closeAmbient')

// 控制小球光源环绕场景移动
let stepLight = 0
const sphereLightAnimation = function(){
    stepLight += 0.02
    sphereLight.position.y = 400
    sphereLight.position.z = 200 +(200 * (Math.sin(stepLight)));
    sphereLight.position.x = 400 + (800 * (Math.cos(stepLight)));
    spotLight.position.copy(sphereLight.position);
}

// 添加动画
let step = 0
const animation = function(){
    // 给新添加的物体添加和原物体一样的动画
    scene.traverse(function(e){
        if (e instanceof THREE.Mesh && e.geometry.type === "BoxGeometry") {
            if (e.name != 'planeCube') {
                // 立方体旋转
                e.rotation.x += guiControl.rotationSpeed
                e.rotation.y += guiControl.rotationSpeed
                e.rotation.z += guiControl.rotationSpeed
            }
        }
    })
    // 球体跳跃
    step += guiControl.bouncingSpeed
    // 200是位移距离、函数决定运动方式
    sphereMesh.position.x = 300 + (200 * (Math.cos(step)))
    sphereMesh.position.y = 150 + (100 * (Math.abs(Math.sin(step))))
}

// 屏幕大小发生变化是重新渲染适应大小
const onResize = function() {
    // 不能使用上面定义的width 和 height，因为他们在第一次初始化就固定了
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize',onResize)

// 渲染到位置body
document.body.appendChild(renderer.domElement)

// 鼠标控制场景旋转
var control = new OrbitControls(camera,renderer.domElement)

// 开始渲染
function render() {
    renderer.render(scene,camera)
    sphereLightAnimation()
    control.update()
    stats.update()
    animation()
    requestAnimationFrame(render)
}
render()

}