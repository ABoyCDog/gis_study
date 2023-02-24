    import * as THREE from '../lib/three/build/three.module.js'
    // 纹理格式加载器
    import { DDSLoader } from '../lib/three/examples/jsm/loaders/DDSLoader.js'
    import { RGBELoader } from '../lib/three/examples/jsm/loaders/RGBELoader.js'
    import { RGBMLoader } from '../lib/three/examples/jsm/loaders/RGBMLoader.js'
    import { TGALoader } from '../lib/three/examples/jsm/loaders/TGALoader.js'
    import { EXRLoader } from '../lib/three/examples/jsm/loaders/EXRLoader.js'
    // 鼠标控制加载器
    import { OrbitControls } from '../lib/three/examples/jsm/controls/OrbitControls.js'

    window.onload = function () {
    // 常用常量
    const width = window.innerWidth
    const height = window.innerHeight
    // 场景
    const scene = new THREE.Scene()
    // 几何图形
    const planGeometry = new THREE.PlaneGeometry(100,100)
    const cubeGeometry = new THREE.BoxGeometry(100,100,100)
    console.log(JSON.stringify(cubeGeometry.toJSON()))
    console.log(cubeGeometry)

    const cube1Geometry = new THREE.BoxGeometry(100,100,100)
    // console.log(cube1Geometry)

    let uvs = new Float32Array([
        //right
        0, 1,
        0.5, 1,
        0, 0.67,
        0.5, 0.67,
        //left
        0.5, 1,
        1, 1,
        0.5, 0.67,
        1, 0.67,
        //top
        0, 0.65,
        0.5, 0.65,
        0, 0.34,
        0.5, 0.34,
        //bottom
        0.5, 0.65,
        1, 0.65,
        0.5, 0.34,
        1, 0.34,
        //positive
        0, 0.32,
        0.5, 0.32,
        0, 0,
        0.5, 0,
        //reverse
        0.5, 0.32,
        1, 0.32,
        0.5, 0,
        1, 0,
    ])
    cube1Geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    const cube1Texture = new THREE.TextureLoader().load('../pic/conbol.jpg')
    const cube1Material = new THREE.MeshBasicMaterial({map:cube1Texture})
    const cube1Mesh = new THREE.Mesh(cube1Geometry,cube1Material)
    // cube1Mesh.position.set(0,0,150)





    // scene.add(cube1Mesh)

    // 材质
    // 创建DDS纹理格式加载器
    const DDSTexture = new DDSLoader().load('../pic/01.dds')
    const HDRTexture = new RGBELoader().load('../pic/01.hdr',function(){
        planMaterialHDR.needsUpdate = true
    })
    const TGATexture = new TGALoader().load('../pic/01.tga')
    const PNGTexture = new RGBMLoader().load('../pic/01.png')
    const JPGTexture = new THREE.TextureLoader().load('../pic/06.jpg')
    const EXRTexture = new EXRLoader().load('../pic/01.exr')
    // 创建材质
    const planMaterialDDS = new THREE.MeshBasicMaterial({
        map:DDSTexture,
    })
    const planMaterialHDR = new THREE.MeshBasicMaterial({
        map:HDRTexture
    })
    const planMaterialTGA = new THREE.MeshBasicMaterial({
        map:TGATexture
    })
    const planMaterialPNG = new THREE.MeshBasicMaterial({
        map:PNGTexture
    })
    const planeMaterialJPG = new THREE.MeshBasicMaterial({
        map:JPGTexture
    })
    const planeMaterialEXR = new THREE.MeshBasicMaterial({
        map:EXRTexture
    })


    // 将材质存进数组   顺序====右左上下前后
    const picArr = [planMaterialDDS,planMaterialHDR,planMaterialTGA,planMaterialPNG,planeMaterialJPG,planeMaterialEXR,]
    console.log(picArr)
    // 构造网络模型
    const planGeometryBasicMaterialMesh = new THREE.Mesh(cubeGeometry,picArr)
    scene.add(planGeometryBasicMaterialMesh)
    console.log(planGeometryBasicMaterialMesh)
    // 光源
    // 点光
    // const pointLight = new THREE.PointLight('#ffffff')
    // pointLight.position.set(200,200,400)
    // scene.add(pointLight)
    // // 环境光
    // const planeAmbient = new THREE.AmbientLight('#ffffff')
    // scene.add(planeAmbient)
    // 相机
    const planeCamera = new THREE.PerspectiveCamera(50,width/height,0.1,1000)
    planeCamera.position.set(400,100,400)
    planeCamera.lookAt(scene.position)
    // 坐标系
    const axesHelper = new THREE.AxesHelper(450)
    scene.add(axesHelper)
    // 渲染器
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        premultipliedAlpha: true
    })
    renderer.setSize(width,height)
    renderer.setClearColor('#3498db')
    document.body.appendChild(renderer.domElement)
    function render() {
        renderer.render(scene,planeCamera)
        requestAnimationFrame(render)
    }
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2
    renderer.outputEncoding = THREE.sRGBEncoding;
    render()

    const controls = new OrbitControls(planeCamera,renderer.domElement)
}