import * as THREE from '../three/build/three.module.js'
import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()

    // 定义渲染器
    let renderer = new THREE.WebGLRenderer({antialias:true})
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#34495e")

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(0,200,300)
    camera.lookAt(scene.position)
    scene.position.set(-50,0,0)

    // 添加坐标轴
    // let axes = new THREE.AxesHelper(100)
    // scene.add(axes)

    // 添加环境光
    let ambient = new THREE.AmbientLight('#fff',.3)
    scene.add(ambient)

    // 添加点光
    let point = new THREE.PointLight('#fff')
    point.position.set(200,200,200)
    scene.add(point)
    let point1 = new THREE.PointLight('#fff')
    point1.position.set(-200,-200,-200)
    scene.add(point1)

    // 创建随机数、根据随机数给添加名字并设置为病毒体
    let virusArr = []
    function getRandom() {
        let num = Math.floor(Math.random() * 1001)
        if (virusArr.indexOf(num) === -1 && virusArr.length <100) {
            virusArr.push(num)
            getRandom()
        } else if(virusArr.indexOf(num) !== -1 && virusArr.length <100) {
            getRandom()
        }
    }
    getRandom()
    // 数组排序
    var compare = function (x, y) {//比较函数
        if (x < y) {
            return -1;
        } else if (x > y) {
            return 1;
        } else {
            return 0;
        }
    }
    virusArr.sort(compare)
    // 创建魔方rubik
    let rubikGroup = new THREE.Group()
    let cubeMat = new THREE.MeshLambertMaterial({color:'#ff9f1a'})
    let virusTexture = new THREE.TextureLoader().load('./病毒.png')
    for(let x=0;x<10;x++){
        for(let y=0;y<10;y++){
            for(let z=0;z<10;z++){
                let cubeGeo = new THREE.BoxGeometry(10,10,10)
                let cube = new THREE.Mesh(cubeGeo,cubeMat)
                cube.position.x = x * 12
                cube.position.y = y * 12
                cube.position.z = z * 12
                // 判断当前位置是否在数组中，若在则设为病毒块
                if (virusArr.indexOf(x * y * z) !== -1) {
                    cube.name = 'virus'
                    cube.material = new THREE.MeshBasicMaterial({color:'cyan',map:virusTexture})
                }
                rubikGroup.add(cube)
            }
        }
    }
    scene.add(rubikGroup)
    console.log(rubikGroup)

    // 射线查询判断当前点击的对象
    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2()
    // 归一化坐标
    function getPosition(event){
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    document.addEventListener('mousemove',getPosition)
    // 处理事件
    let target,targetObj
    scene.children.forEach(item => {
        if (item.type === 'Group') targetObj = item.children
    })
    document.addEventListener('click',function(){
        raycaster.setFromCamera(mouse,camera)
        let intersects = raycaster.intersectObjects(targetObj)
        if (intersects != '') {
            target = intersects[0].object
            if (target.name === 'virus') alert('游戏结束')
            else target.material = new THREE.MeshBasicMaterial({color:'#000'})
        }
    })

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize );

    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 控制器
    let control = new OrbitControls(camera,renderer.domElement)
    control.enableDamping = true;

    // 渲染场景
    function render(){
        control.update()
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}