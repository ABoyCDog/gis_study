import * as THREE from '../three/build/three.module.js'
import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js'

// 定义场景
let scene = new THREE.Scene()

// 定义渲染器
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.setClearColor('#909090')
// 渲染到页面
document.body.appendChild(renderer.domElement)

// 定义相机
let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
camera.position.set(200,300,800)

// 添加灯光
let ambient = new THREE.AmbientLight('#fff')
scene.add(ambient)

// 控制器
let control = new OrbitControls(camera,renderer.domElement)
control.enableDamping = true;
control.target = new THREE.Vector3(200,0,0)


// 窗口大小更改
function resize(){

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth,window.innerHeight)
    
}
window.addEventListener('resize',resize)

let video = document.querySelector('video')

if(video.canPlayType) {
    video.removeAttribute('muted')
    video.play()
}

let videoTexture = new THREE.VideoTexture(video)

{

    for( let i=1; i<=20; i++ ) {

        for( let j=1; j<=10; j++ ) {

            let geo = new THREE.BoxGeometry(10,10,10)

            // let material = new THREE.MeshBasicMaterial({

            //     color: new THREE.Color( 'rgb(' + Math.floor(Math.random()*200+20)+','+Math.floor(Math.random()*200+10)+','+Math.floor(Math.random()*100+40) +')' )

            // })

            let material = new THREE.MeshPhongMaterial({

                map:videoTexture

            })

            for( let k=0; k<geo.faceVertexUvs[0].length; k+=2 ){

                let item = geo.faceVertexUvs[0][k]
                let item1 = geo.faceVertexUvs[0][k+1]

                // 第一个三角面
                item[0].x =  1 / 20 * i
                item[0].y =  1 / 10 * j

                item[1].x =  1 / 20 * i
                item[1].y =  item[0].y - 1 / 10

                item[2].x =  item[0].x + 1 / 20
                item[2].y =  1 / 10 * j

                // 平面第二个三角面

                item1[0].x =  1 / 20 * i
                item1[0].y =  item[0].y - 1 / 10

                item1[1].x =  item[0].x + 1 / 20
                item1[1].y =  item[0].y - 1 / 10

                item1[2].x =  item[0].x + 1 / 20
                item1[2].y =  1 / 10 * j

            }

            let box = new THREE.Mesh( geo, material )

            box.name = 'box'
            box.position.set( i*10 + 300, j*10, 0 )
            box.userData.first = true
            // 控制当前动画执行次数
            box.userData.num = 0

            scene.add(box)

        }

    }

}


// 存放当前数据
let rectangleArr = []
// 创建球体获取其点位
let sphereGeometry = new THREE.SphereGeometry(200,18,12)
// 球心坐标
let sphereCenterArr = []
// 变换速率
let unit = 500
// 控制变换顺序
let num = 0

// 记录当前位置
scene.traverse(function(element){

    if(element.isMesh && element.name == 'box') {

        rectangleArr.push(element)

    }

})

// 获取球的点的位置
sphereGeometry.vertices.forEach(( item, index ) => {

    // 新的球体以便获取其中心
    let sphere = new THREE.Sphere()

    // 通过矩形点和球的点一一对应构建新的球并获取球心
    let arr = [rectangleArr[index].position, item]

    sphere.setFromPoints(arr)

    sphereCenterArr.push(sphere.center)

})

function transform(){

    num += 0.03
    sphereGeometry.vertices.forEach(( item, index ) => {

        if(num <= index) return

        rectangleArr[index].userData.num ++

        // 1、矩形变化到球
        let spherical = new THREE.Spherical(),
        // 矩形的变化的偏移量
        offset = new THREE.Vector3(),
        // 球的变换的偏移量
        offset1 = new THREE.Vector3(),
        target = sphereCenterArr[index]

        offset1.copy( item ).sub( target )

        spherical.setFromVector3( offset1 )

        let phi = spherical.phi
        let theta = spherical.theta

        offset.copy( rectangleArr[index].position ).sub( target )

        spherical.setFromVector3( offset )
        
        if(rectangleArr[index].userData.first) {

            rectangleArr[index].userData.theta = (spherical.theta - theta) / unit
            rectangleArr[index].userData.phi = (spherical.phi - phi) / unit

            rectangleArr[index].userData.first = false
            
        }

        // 控制动画循环播放
        if(rectangleArr[index].userData.num <= unit) {

            spherical.phi -= rectangleArr[index].userData.phi
            spherical.theta -= rectangleArr[index].userData.theta

        } else if(rectangleArr[index].userData.num > unit *4 && rectangleArr[index].userData.num <= unit *5 ){

            spherical.phi += rectangleArr[index].userData.phi
            spherical.theta += rectangleArr[index].userData.theta

        } else if(rectangleArr[index].userData.num > unit *13) {

            rectangleArr[index].userData.num = 0

        }

        spherical.makeSafe()

        offset.setFromSpherical( spherical )
        
        rectangleArr[index].position.copy( target ).add( offset )

    })

}

// 渲染场景
function render(){

    control.update()

    renderer.render(scene,camera)

    requestAnimationFrame(render)

    transform()


}

render()