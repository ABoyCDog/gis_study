import * as THREE from '../three/build/three.module.js'
import {OrbitControls} from './OrbitControls.js'
// import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
import { ConvexGeometry, ConvexBufferGeometry } from '../three/examples/jsm/geometries/ConvexGeometry.js'
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
    camera.position.set(0,100,300)
    camera.lookAt(new THREE.Vector3(0,0,0))

    // 添加坐标轴
    // let axes = new THREE.AxesHelper(100)
    // scene.add(axes)

    let gridHelper = new THREE.GridHelper( 1000, 1000,'#2f3542' );
    scene.add( gridHelper );

    // 添加灯光
    let ambient = new THREE.AmbientLight('#fff')
    scene.add(ambient)

    // 创建几何体
    // 半径、细分数、细分数、x轴开始画圆位置、大小、y轴画圆位置、大小
    let spahereGeo = new THREE.SphereGeometry(20,10,10,Math.PI * 0,Math.PI * 0.75)
    let mat = new THREE.MeshNormalMaterial()
    mat.side = THREE.DoubleSide
    let sphere = new THREE.Mesh(spahereGeo,mat)

    // 圆柱
    // 上底、下底、高度、细分数、细分数、是否封顶====上下底使用负数会生成漏斗样式，如果是上底面为负，需要设置成材质双面渲染才能看见
    let cylinderGeo = new THREE.CylinderGeometry(10,-10,20,10,10,false)
    let cylinder = new THREE.Mesh(cylinderGeo,mat)

    // 圆环
    // 环心尺寸、圆环本身半径、细分数、细分数、大小
    let torusGeo = new THREE.TorusGeometry(10,3,8,6,Math.PI)
    let torus = new THREE.Mesh(torusGeo,mat)

    // 环面纽结
    // 环心尺寸，本身半径、细分数、细分数、定义形状（多久旋转一次）、定义形状（绕轴旋转多少次）、拉伸
    let TorusKnotGeo = new THREE.TorusKnotGeometry(10,2,100,100,4,3)
    let torusKnot = new THREE.Mesh(TorusKnotGeo,mat)

    // 使用一组点构造新的形状、最少四个点
    let arr = [
        new THREE.Vector3(10,10,10),
        new THREE.Vector3(5,5,5),
        new THREE.Vector3(13,10,10),
        new THREE.Vector3(10,20,10),
    ]
    let convexGeo = new ConvexGeometry(arr)
    let convex = new THREE.Mesh(convexGeo,mat)

    // 平面旋转形成3维形状
    // 需要构建得数组、细分数、从圆得什么地方开始画、画圆大小 0- 2PI
    let latheArr = [
        new THREE.Vector3(10,10,10),
        new THREE.Vector3(5,5,5),
        new THREE.Vector3(13,10,10),
        new THREE.Vector3(10,20,10),
    ]
    let latheGeo = new THREE.LatheGeometry(latheArr)
    let lathe = new THREE.Mesh(latheGeo,mat)

    // 自定义创建形状
    let shapePig,DIYShape,Dshape
    function shapeFun() {
        shapePig = new THREE.Shape()
        shapePig.moveTo(0,100)
        shapePig.lineTo(-20,80)
        shapePig.quadraticCurveTo(-25,70,-30,30)
        shapePig.moveTo(-20,60)
        shapePig.lineTo(-20,40)
        shapePig.moveTo(-10,60)
        shapePig.quadraticCurveTo(-20,65,-10,0)
        let hole = new THREE.Path()
        hole.arc(-15,77,3,0,Math.PI*2,false)
        shapePig.holes.push(hole)
    }
    shapeFun()
    // 创建形状
    DIYShape = new THREE.ShapeGeometry(shapePig)
    // 根据路径绘制线段
    Dshape = new THREE.Line(shapePig.createPointsGeometry(10),new THREE.LineBasicMaterial({color:'red'}))
    // Dshape = new THREE.Mesh(DIYShape,mat)

    // 平面拉伸
    let optionsExtrude = {
        amount: 0.001, //图形拉伸长度
        bevelThickness:1, //斜角深度、前后面和拉伸角之间得倒角
        bevelSize:0.1, //斜角高度
        bevelSegments:2, //斜角细分数
        bevelEnabled:true, //是否启用斜角
        curveSegments:12, //曲线细分数
        steps:1, //拉伸体被分成得段数
    }
    let extrudeGeo = new THREE.ExtrudeGeometry(shapePig,optionsExtrude)
    let extrude = new THREE.Mesh(extrudeGeo,mat)


    // 构建组存放几何
    let group = new THREE.Group()
    group.add(sphere,cylinder,torus,torusKnot,convex,lathe,Dshape,extrude)

    group.children.forEach((item,index)=>{
        item.position.y = 20
        item.position.x = 40 * (index - 3)
    })

    scene.add(group)
    // scene.add(sphere,cylinder,torus,torusKnot,convex,lathe,Dshape,extrude)
    
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


    // 射线获取对象
    console.log(scene)
    let point
    function getPoint(){
        // 通过射线查询获取场景中的对象、再将对象赋给控制器
        let raycaster = new THREE.Raycaster()
        let mouse = new THREE.Vector2()
        let intersects
        
        document.addEventListener('dblclick',function(event){
            if(event.button!=0) return
            // // 坐标归一化
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

            raycaster.setFromCamera(mouse,camera)

            // 获取对象
            intersects = []
            raycaster.intersectObjects(scene.children,true,intersects)
            if(intersects && intersects.length>0) point = intersects[0].point


            camera.lookAt(point)
            // initControl(point)

            control.target = point

            // control.setAngle(camera.position.distanceTo(point))

            
        })
    }
    getPoint()

    // initControl(new THREE.Vector3())

    // function initControl(point) {
    //     var dom = renderer.domElement;
    //     //鼠标按下时获取到当前相机的位置，并求出当前相机距离原点的位置
    //     var distance; //相机距离中心点的距离
    //     var pan, tilt; //相机的水平角度和垂直角度
    //     var downX, downY; //鼠标按下时的xy坐标
    //     var matrix = new THREE.Matrix4(); //声明一个旋转矩阵

    //     //绑定按下事件
    //     dom.addEventListener("mousedown", function (e) {
    //         distance = camera.position.distanceTo(new THREE.Vector3());
    //         computePanTilt(camera.position);

    //         downX = e.clientX;
    //         downY = e.clientY;

    //         //绑定移动事件
    //         document.addEventListener("mousemove", move);

    //         //绑定鼠标抬起事件
    //         document.addEventListener("mouseup", up);
    //     });

    //     //鼠标移动事件
    //     function move(e) {
    //         var moveX = e.clientX;
    //         var moveY = e.clientY;

    //         //计算鼠标的偏移量当前相机的pan和tilt
    //         var offsetX = moveX - downX;
    //         var offsetY = moveY - downY;

    //         var movePan = pan - offsetX / 3;
    //         var moveTilt = tilt - offsetY;

    //         //tilt的移动范围是90到-90度
    //         if (moveTilt >= 90) {
    //             moveTilt = 89;
    //         }

    //         if (moveTilt <= -90) {
    //             moveTilt = -89;
    //         }

    //         //根据pan和tilt计算出当前的相机应该所在的位置
    //         var p = computePosition(distance, movePan, moveTilt);
    //         camera.position.set(p.x, p.y, p.z);
    //         camera.lookAt(point);
    //     }

    //     //鼠标抬起事件
    //     function up() {
    //         //清楚绑定事件
    //         document.removeEventListener("mousemove", move);
    //         document.removeEventListener("mouseup", up);
    //     }

    //     //根据当前点到原点的线计算出到原点z轴正方向的pan和tilt的偏移量
    //     function computePanTilt(position) {
    //         //首先计算水平的偏移角度
    //         pan = new THREE.Vector3(position.x, 0, position.z).angleTo(new THREE.Vector3(0, 0, 1));

    //         pan = pan / Math.PI * 180;
    //         if (position.x < 0) {
    //             pan = 360 - pan;
    //         }

    //         //计算垂直的偏移角度
    //         tilt = new THREE.Vector3(position.x, 0, position.z).angleTo(position);

    //         tilt = tilt / Math.PI * 180;
    //         if (position.y > 0) {
    //             tilt = -tilt;
    //         }
    //     }

    //     //根据pan和tilt 相机到原点的距离计算出相机当前所在的位置
    //     function computePosition(distance, pan, tilt) {
    //         //重置旋转矩阵
    //         matrix.identity();

    //         var v = new THREE.Vector3(0, 0, distance);

    //         //根据pan和tilt修改旋转矩阵，注意顶点旋转计算需要按照xyz的顺序旋转

    //         matrix.makeRotationX(tilt / 180 * Math.PI);
    //         v.applyMatrix4(matrix);

    //         matrix.makeRotationY(pan / 180 * Math.PI);
    //         v.applyMatrix4(matrix);

    //         //计算出当前相机的位置
    //         return v;
    //     }
    // }


    // 渲染场景
        function render(){
        control.update()
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
    render()
}