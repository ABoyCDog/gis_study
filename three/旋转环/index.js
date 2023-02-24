import * as THREE from '../three/build/three.module.js'
import {SVGRenderer} from '../three/examples/jsm/renderers/SVGRenderer.js'
import {OrbitControls} from '../three/examples/jsm/controls/OrbitControls.js'
window.onload = function() {

    // 定义场景
    let scene = new THREE.Scene()

    // 定义渲染器
    let renderer = new SVGRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor("#f5ad47")
    // 渲染到页面
    document.body.appendChild(renderer.domElement)

    // 定义相机
    let camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,10000)
    camera.position.set(0,5,5)
    camera.lookAt(new THREE.Vector3(0,0,0))

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

    let vertices = []
    const divisions = 50
    function geo(){

        for ( let i = 0; i <= divisions; i ++ ) {

            const v = ( i / divisions ) * ( Math.PI * 2 );

            const x = Math.sin( v );
            const z = Math.cos( v );

            vertices.push( x, 0, z );

        }

        let geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3))

        for(let i=1;i<=4;i++){
            let material = new THREE.LineBasicMaterial({
                color:'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')',
                linewidth:10
            })
            let circel = new THREE.Line(geometry,material)
            circel.scale.setScalar(i * 0.25)
            circel.userData.rotationUnit = i * 0.75
            scene.add(circel)
        } 

    }
    geo()
    let div = document.createElement('div')
    div.innerHTML = '<div style="position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);color: #fff;font-size: 36px;">加载中...</div>'
    document.body.appendChild(div)

    // 渲染场景
    let clock = new THREE.Clock(),currentTime = 0
    function render(){
        let delta = clock.getDelta()
        currentTime+=delta

        control.update()

        renderer.render(scene,camera)

        requestAnimationFrame(render)

        scene.children.forEach((element)=>{

            element.rotation.x = currentTime * element.userData.rotationUnit
            element.rotation.z = currentTime * element.userData.rotationUnit
            
        })
        
    }
    render()
}