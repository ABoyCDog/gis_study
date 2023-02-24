import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'


// 创建分支，利用另外得线程执行程序，避免影响渲染
Physijs.scripts.worker = '../libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js'

// 创建场景
let scene = new Physijs.Scene
// 添加重力为y轴方向==允许物体下落
// scene.setGravity(new THREE.Vector3(10,0,0))
scene.setGravity(new THREE.Vector3(0,-50,0))

// 创建颜色
let scale = chroma.scale(['green','yellow','orange'])
console.log(scale)


// 创建包围圈
let ground
;(function (){
    let mat = new Physijs.createMaterial(
        new THREE.MeshPhongMaterial({map:new THREE.TextureLoader().load('../images/01.jpg')}),1,0.6
    )
    let mat1 = new Physijs.createMaterial(
        new THREE.MeshPhongMaterial({map:new THREE.TextureLoader().load('../images/06.jpg')}),1,0.6
    )
    // 创建地面
    ground = new Physijs.BoxMesh(new THREE.BoxGeometry(100,100,4),mat,0)
    ground.rotation.x = Math.PI / -2
    ground.position.y = 2
    scene.add(ground)
    // 创建前后左右四个包围圈
    let left = new Physijs.BoxMesh(new THREE.BoxGeometry(108,20,4),mat1,0)
    left.position.x = -52
    left.position.y = 10
    left.rotation.y = Math.PI / 2
    scene.add(left)

    let right = new Physijs.BoxMesh(new THREE.BoxGeometry(108,20,4),mat1,0)
    right.position.y = 10
    right.position.x = 52
    right.rotation.y = Math.PI / 2
    scene.add(right)

    let forWard = new Physijs.BoxMesh(new THREE.BoxGeometry(108,20,4),mat1,0)
    forWard.position.y = 10
    forWard.position.z = -52
    scene.add(forWard)

    let backWard = new Physijs.BoxMesh(new THREE.BoxGeometry(108,20,4),mat1,0)
    backWard.position.y = 10
    backWard.position.z = 52
    scene.add(backWard)

})();


// 创建点约束
;(function(){
    let mat = new Physijs.createMaterial(
        new THREE.MeshPhongMaterial({color:'red'})
    )
    let geo = new THREE.SphereGeometry(5,20,20)
    let point1 = new Physijs.SphereMesh(geo,mat)
    point1.position.x = -30
    point1.position.y = 9
    point1.position.z = -30
    scene.add(point1)

    let point2 = new Physijs.SphereMesh(geo,mat)
    point2.position.x = -10
    point2.position.y = 9
    point2.position.z = -30
    scene.add(point2)

    let constraint = new Physijs.PointConstraint(point1, point2, point1.position)
    scene.addConstraint(constraint)
}())

// 固定轴约束移动
let  constraint1
;(function() {
    var sliderCube = new THREE.BoxGeometry(30, 2, 2);
    var sliderMesh = new Physijs.BoxMesh(sliderCube, Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
            color: 0x44ff44, opacity: 0.6, transparent: true
        }), 0.1, 0.1));
    sliderMesh.position.z = -40;
    sliderMesh.position.x = 6;
    sliderMesh.position.y = 9;
    scene.add(sliderMesh);
    constraint1 = new Physijs.SliderConstraint(sliderMesh, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.PI / -2, 0, 0));

    scene.addConstraint(constraint1);
    // 线性移动、弧度移动
    constraint1.setLimits(20, 10, 0, 0);
    // 达到极限的时候回复量
    constraint1.setRestitution(10, 10);

    constraint1.disableLinearMotor();
    constraint1.enableLinearMotor(10, 10);
})()



// 定义渲染器
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setClearColor("#000")
// 渲染到页面
document.body.appendChild(renderer.domElement)

// 定义相机
let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
camera.position.set(0,80,100)
camera.lookAt(new THREE.Vector3(0,0,0))


// 添加灯光
let ambient = new THREE.AmbientLight('#fff')
scene.add(ambient)


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
    scene.simulate()
}
render()