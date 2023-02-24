import * as THREE from '../three/build/three.module.js'
import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js'


// 定义场景
let scene = new THREE.Scene()

// 定义渲染器
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
// 渲染到页面
document.body.appendChild(renderer.domElement)

// 定义相机
let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
camera.position.set(0,300,1000)
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

let video = document.querySelector('video')

if(video.canPlayType) {
    video.removeAttribute('muted')
    video.play()
}




// scene.add(new THREE.AxesHelper(10000))


let videoTexture = new THREE.VideoTexture(video)

var group = new THREE.Group()
;(function(){

    for( let i=1; i<=20; i++ ) {

        for( let j=1; j<=10; j++ ) {

            let geo = new THREE.BoxGeometry(10,10,10)

            let material = new THREE.MeshBasicMaterial({

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
            box.position.set( i*10, j*10, 0 )

            box.userData.x = i
            box.userData.y = j
            box.userData.sphereRotation = i*j

            // 判断是不是第一次执行变换
            box.userData.first = true
            // 当前phi
            box.userData.phi = 0
            // 当前theta
            box.userData.theta = 0

            group.add(box)
            group.position.y = 5
            group.position.x = -95

            scene.add(group)

        }

    }

})();

group.position.x = -20
group.position.y = -50
function type1(){

    group.children.forEach( item=>{
        
        let spherical = new THREE.Spherical(),offset = new THREE.Vector3()
        let target = new THREE.Vector3()


        offset.copy(item.position).sub(target)

        spherical.setFromVector3( offset )

        spherical.theta -= item.userData.x * 0.0015

        spherical.phi -= item.userData.y * 0.0001

        if(spherical.phi <= 0.4) {

            spherical.phi += item.userData.y * 0.001

        }

        spherical.makeSafe()

        offset.setFromSpherical(spherical)

        item.position.copy(target).add(offset)

    } )

}


let flag = true
function type2(){

    if (flag) {

        group.children.forEach( (item,index) =>{

            item.position.set(index * 1,index * 1.5,0)
        })

        group.position.y = -100

        flag = false

    }

    group.children.forEach( (item,index) =>{

        let spherical = new THREE.Spherical(),offset = new THREE.Vector3()
        let target = new THREE.Vector3()

        offset.copy(item.position).sub(target)

        spherical.setFromVector3( offset )

        spherical.theta -= item.userData.sphereRotation * 0.0001

        spherical.makeSafe()

        offset.setFromSpherical(spherical)

        item.position.copy(target).add(offset)

    } )

}

let shpGeo = new THREE.SphereGeometry(200,18,12)

let sphereCenterArr = []

shpGeo.vertices.forEach( ( item, index ) => {

    // 通过将要变化的box位置和变化之后的点进行计算，求出他们的最小包围球
    let transformSphere = new THREE.Sphere()

    let arr = [group.children[index].position, item]

    transformSphere.setFromPoints(arr)

    // 将球心存进数组
    sphereCenterArr.push(transformSphere.center)

})

let timmer = 0,timming = 500,timmingEnd = 1000
function type3(){

    timmer++
    group.children.forEach( (item,index) =>{

        let target = sphereCenterArr[index],
        spherical = new THREE.Spherical(),
        offset = new THREE.Vector3(),
        offset1 = new THREE.Vector3()


        // group.rotation.y -= 0.00002


        offset1.copy( shpGeo.vertices[index] ).sub( target )

        // 获取变换之后的球坐标以及位置
        spherical.setFromVector3( offset1 )

        let theta = spherical.theta
        let phi = spherical.phi

        // 获取变化过程中的球坐标以及位置
        offset.copy( item.position ).sub( target )
        spherical.setFromVector3( offset )

        // 设置每次变化的幅度
        if( item.userData.first ){

            item.userData.theta = ( spherical.theta - theta ) / timming
            item.userData.phi = ( spherical.phi - phi ) / timming

            item.userData.first = false

        }

        if( timmer <= timming ){

            spherical.phi -= item.userData.phi
            spherical.theta -= item.userData.theta

        } else if(timmer >= timming+100 && timmer <= timmingEnd+100 ){

            spherical.phi += item.userData.phi
            spherical.theta += item.userData.theta

        } else if(timmer >= timmingEnd+200) timmer = 0

        spherical.makeSafe()

        offset.setFromSpherical( spherical )

        item.position.copy( target ).add( offset )


    } )

}


// 渲染场景

renderer.setClearColor('#909090')

function render(){

    control.update()
    renderer.render(scene,camera)
    requestAnimationFrame(render)

    type1()
    type2()
    // type3()

}
render()