window.onload = function(){
        /**
     * 创建场景对象Scene
     */
         var scene = new THREE.Scene();
         /**
          * 创建网格模型
          */
         // var geometry = new THREE.SphereGeometry(60, 40, 40); //创建一个球体几何对象
         var geometry = new THREE.BoxGeometry(100, 100, 100); //创建一个立方体几何对象Geometry
         // 设置基本属性   MeshLambertMaterial漫反射
         var material = new THREE.MeshLambertMaterial({
           color: 0x0000ff,
           opacity:0.7,
         //   wireframe: true,  // 将材质改为线状
         transparent:true  //必须开启为true设置透明度才有效果
         }); //材质对象Material  
         // 添加高光效果  MeshPhongMaterial镜面反射
         var material=new THREE.MeshPhongMaterial({
             color:0x0000ff,
             specular:0x4488ee,   //颜色
             shininess:5       //强度
         });
         var mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
         scene.add(mesh); //网格模型添加到场景中
         /**
          * 辅助三维坐标系 
          */ 
          var axisHelper = new THREE.AxisHelper(250);
             scene.add(axisHelper);
         /**
          * 光源设置
          */
         //点光源
         var point = new THREE.PointLight(0xe74c3c);
         point.position.set(400, 200, 300); //点光源位置
         scene.add(point); //点光源添加到场景中
         //环境光
         var ambient = new THREE.AmbientLight(0x444444);
         scene.add(ambient);
         // console.log(scene)
         // console.log(scene.children)
         /** 
          * 相机设置
          */
         var width = window.innerWidth; //窗口宽度
         var height = window.innerHeight; //窗口高度
         var k = width / height; //窗口宽高比
         var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
         //创建相机对象
         var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
         camera.position.set(100, 300, 200); //设置相机位置
         camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
         /**
          * 创建渲染器对象
          */
         var renderer = new THREE.WebGLRenderer();
         renderer.setSize(width, height);//设置渲染区域尺寸
         renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
         document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
         //执行渲染操作   指定场景、相机作为参数、常规渲染
         // renderer.render(scene, camera);
         // 使用定时器
         // function render() {
         // renderer.render(scene,camera);//执行渲染操作
         // mesh.rotateY(0.01);//每次绕y轴旋转0.01弧度
         // }
         // //间隔20ms周期性调用函数fun,20ms也就是刷新频率是50FPS(1s/20ms)，每秒渲染50次
         // setInterval("render()",20);
         // 使用requestAnimationFrame 代替setinterval，效果一样，前者能更好的利用浏览器渲染，默认在60fps
         // function render() {
         //     renderer.render(scene,camera);//执行渲染操作
         //     mesh.rotateY(0.01);//每次绕y轴旋转0.01弧度
         //     requestAnimationFrame(render);//请求再次执行渲染函数render
         // }
         // render();
         // 由于requestAnimationFrame是默认的刷新率，会受到程序复杂程度影响，所以需要设置执行时间控制刷新频率保持一致
         let T0 = new Date();//上次时间
         function render() {
             let T1 = new Date();//本次时间
             let t = T1-T0;//时间差
             T0 = T1;//把本次时间赋值给上次时间
             requestAnimationFrame(render);
             renderer.render(scene,camera);//执行渲染操作
             mesh.rotateY(0.001*t);//旋转角速度0.001弧度每毫秒
         }
         var geometry1 = new THREE.SphereGeometry(60,40,40)
         var material1 = new THREE.MeshLambertMaterial({
             color: 0xffffff
         })
         var mesh1 = new THREE.Mesh(geometry1,material1)
         scene.add(mesh1)
         render();
         // 鼠标控制
         var controls = new THREE.OrbitControls(camera,renderer.domElement);//创建控件对象
         // 不与requsetAnimationFrame同时使用，因为前者本身就是在反复调用，所以不必再监听改变事件
         // controls.addEventListener('change', render);//监听鼠标、键盘事件
}