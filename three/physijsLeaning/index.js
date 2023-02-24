import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'


// 创建分支，利用另外得线程执行程序，避免影响渲染
Physijs.scripts.worker = '../libs/physijs_worker.js'
Physijs.scripts.ammo = '../libs/ammo.js'

// 创建场景
let scene = new Physijs.Scene
// 添加重力为y轴方向==允许物体下落
scene.setGravity(new THREE.Vector3(10,0,0))
scene.setGravity(new THREE.Vector3(0,-50,0))
// scene.setGravity(new THREE.Vector3(0,-50,0))

function getPoints() {
    var points = [];
    var r = 27;
    var cX = 0;
    var cY = 0;

    var circleOffset = 0;
    for (var i = 0; i < 1000; i += 6 + circleOffset) {

        circleOffset = 4.5 * (i / 360);

        var x = (r / 1440) * (1440 - i) * Math.cos(i * (Math.PI / 180)) + cX;
        var z = (r / 1440) * (1440 - i) * Math.sin(i * (Math.PI / 180)) + cY;
        var y = 0;

        points.push(new THREE.Vector3(x, y, z));
    }

    return points;
}


// 创建多米诺方块
let dominoseArr = []
getPoints().forEach(item=>{
    let Geometry = new THREE.BoxGeometry(0.6,6,2)
    let mat = new THREE.MeshPhongMaterial({color:new THREE.Color(Math.random(),Math.random(),0),transparent:true,opacity:0.8})
    let Dominoes = new Physijs.BoxMesh(Geometry,mat)
    Dominoes.position.copy(item)
    Dominoes.lookAt(scene.position)
    // 监听角度改变
    Dominoes.__dirtyRotation = true
    // 监听位置变化
    Dominoes.__dirtyPosition = true
    Dominoes.position.y = 3.5
    dominoseArr.push(Dominoes)
    scene.add(Dominoes)
})
dominoseArr[0].rotation.x = 0.2
dominoseArr[0].__dirtyRotation = true;

function createGround() {
    var ground_material = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('../images/02.jpg')}),
            1, .3);// friction摩擦系数、restitution弹性系数

    var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 1, 60), ground_material, 0);

    var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 60), ground_material, 0);
    borderLeft.position.x = -31;
    borderLeft.position.y = 2;
    ground.add(borderLeft);

    var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 60), ground_material, 0);
    borderRight.position.x = 31;
    borderRight.position.y = 2;
    ground.add(borderRight);

    var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(64, 3, 2), ground_material, 0);
    borderBottom.position.z = 30;
    borderBottom.position.y = 2;
    ground.add(borderBottom);

    var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(64, 3, 2), ground_material, 0);
    borderTop.position.z = -30;
    borderTop.position.y = 2;
    ground.add(borderTop);

    scene.add(ground);
}
createGround()

// 定义渲染器
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setClearColor("#a4b0be")
// 渲染到页面
document.body.appendChild(renderer.domElement)

// 定义相机
let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
camera.position.set(0,30,70)
camera.lookAt(new THREE.Vector3(0,0,0))


let gridHelper = new THREE.GridHelper( 1000, 100,'#2f3542' );
scene.add( gridHelper );

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