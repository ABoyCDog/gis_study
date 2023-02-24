    const scene = new THREE.Scene()
    const geometry = new THREE.BufferGeometry()
    // 第一个点为起点，逆时针开始画图，每个三角形（013、312）
    let w = 100
    // 构造正四面体,设置每个面四个点的位置，每个面的起点都为其正视图左上角，逆时针设置四个点
    const vertices = new Float32Array([
        // bottom
        0,0,0,
        0,0,w,
        w,0,w,
        w,0,0,
        // left
        0,w,0,
        0,0,0,
        0,0,w,
        0,w,w,
        // right
        w,w,w,
        w,0,w,
        w,0,0,
        w,w,0,
        // reverse
        0,w,0,
        0,0,0,
        w,0,0,
        w,w,0,
        // positive
        0,w,w,
        0,0,w,
        w,0,w,
        w,w,w,
        // top
        0,w,0,
        0,w,w,
        w,w,w,
        w,w,0,
        
    ])
    // 定义顶点颜色
    const colors = new Float32Array([
        //bottom
        0, 0, 1,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0,
        //left
        0, 0, 1,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0,
        //right
        0, 0, 1,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0,
        //reverse
        0, 0, 1,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0,
        //positive
        0, 0, 1,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0,
        //top
        0, 0, 1,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0
    ])
    // 根据每个面顺序为013、312的顺序，完成6个面（12个三角形的拼接），组成立体几何
    // 6个四形、12个三角形、36个顶点
    geometry.setIndex([
        //bottom
        2, 1, 0,
        3, 2, 0,
        //left
        4, 5, 7,
        7, 5, 6,
        //right
         8, 9, 10,
        8, 10, 11,
        //reverse
        15, 14, 13,
        15, 13, 12,
        //positive
        16, 17, 19,
        19, 17, 18,
        //top
        20, 21, 22,
        20, 22, 23
    ])
    // 将提前设置好的点每三个分为一组
    const attribue = new THREE.BufferAttribute(vertices, 3);
    // 分好的组位置设为组成几何体的顶点位置
    geometry.attributes.position = attribue

    const color = new THREE.BufferAttribute(colors,3)  //三个为一组，组成颜色对象
    // 写入颜色
    geometry.attributes.color = color
    // 设置uv坐标映射
    /*
    使用拼接图时重新定义四个点的位置
    经验：uv坐标是固定的，图像宽高会被定义为1个长度，
    但是图像本身和坐标没有直接联系，定义uv坐标只是为了将自己对图像位置固定到坐标系中、
    也就是说我们可以自己将图像任意四个点固定到坐标系中，同时这四个点对应坐标的四个顶点、
    由此我们可以随意控制图像的显示区域
    tips：先使用原图调整自己需要的合适位置，在重新定义新点
    */
    let uvs = new Float32Array([
        //bottom
        0.5, 0.33,
        0.5, 0,
        1, 0,
        1, 0.33,
        //left
        0, 0.33,
        0, 0,
        0.5, 0,
        0.5, 0.33,
        //right
        0.5, 0.66,
        0.5, 0.33,
        1, 0.33,
        1, 0.66,
        //reverse
        0, 0.66,
        0, 0.33,
        0.5, 0.33,
        0.5, 0.66,
        //positive
        0, 1,
        0, 0.66,
        0.5, 0.66,
        0.5, 1,
        //top
        0.5, 1,
        0.5, 0.66,
        1, 0.66,
        1, 1,
    ])
    // 两个为一组
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    const phmaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        // vertexColors:true
    })
    const textureLoader = new THREE.TextureLoader();
    // 执行load方法，加载纹理贴图成功后，返回一个纹理对象Texture
    let mesh
    textureLoader.load('../pic/conbol.jpg', function(texture) {
        let material = new THREE.MeshBasicMaterial({
        // color: 0x0000ff,
        // 设置颜色纹理贴图：Texture对象作为材质map属性的属性值
        map: texture,//设置颜色贴图属性值
        }); //材质对象Material
        mesh = new THREE.Mesh(geometry,material)
        scene.add(mesh)
        render()
    })
    // 坐标系
    const axisHelper = new THREE.AxisHelper(450);
    scene.add(axisHelper);

    // 点光源
    const point = new THREE.PointLight(0xe74c3c)
    point.position.set(400,300,200)
    scene.add(point)

    // 环境光
    const ambient = new THREE.AmbientLight(0x111)
    scene.add(ambient)
    
    //创建相机对象
    const camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,1, 1000);
    camera.position.set(300, 300, 600); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    // 渲染器
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor(0xb9d3ff,1)
    document.body.appendChild(renderer.domElement)

    function render() {
        renderer.render(scene,camera);//执行渲染操作
        requestAnimationFrame(render)
    }
    const controls = new THREE.OrbitControls(camera,renderer.domElement)
    // controls.addEventListener('change', render);//监听鼠标、键盘事件