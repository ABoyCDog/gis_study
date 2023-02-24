import {

    EventDispatcher,
    Euler,
    Vector3,
    Matrix4,
    Raycaster

} from "./three.module.js"

var firstPersonalControl = function(camera,scene,domElEment){

    /**
     * w or ⬆ ：前进
     * s or ⬇ ：后退
     * a or <- ：左移动
     * d or -> ：右移动
     * e or space：上浮
     * q：下浮
     * */ 

    this.camera = camera

    // domElEment.pointerLockElement
    this.dom = domElEment

    this.scene = scene

    // 前进速度
    this.forwardSpeed = 100

    // 前进模式(horizontal:以当前相机方向做水平移动    direction:以当前相机方向为前进方向 )
    this.forwardMode = 'horizontal'

    // 是否显示相机目标中心指针
    this.targetPointer = true

    // 左右移动速度
    this.asideSpeed = 100

    // 上下移动速度
    this.upSpeed = 50

    // 惯性系数
    this.damping = 0.05

    // 是否开启惯性
    this.enableDamping = true

    this.rotationSpeed = 1

    // 是否开启碰撞检测(仅发射一条与相机视线方向一致的射线)
    this.Collision = false

    // 碰撞检测生效距离(相机与目标的距离)
    this.CollisionDistance = 500


    var scope = this

    // 设置欧拉角以及旋转顺序
    var euler = new Euler( 0, 0, 0, 'YXZ' )
    var PI_2 = Math.PI / 2
    var vec = new Vector3()
    var minPolarAngle = 0
    var maxPolarAngle = Math.PI

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var moveUp = false
    var moveDown = false

    // 函数执行区

    function onMouseMove( event ) {

        // 返回当前位置与上一个mousemove事件之间的水平距离（单位像素）
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        // 四元数表示相机当前相机的朝向，也即是旋转角度
        euler.setFromQuaternion( scope.camera.quaternion );

        // 使用欧拉角做旋转变换，用四元数记录旋转状态
        euler.y -= (movementX / window.innerWidth) * Math.PI / 2 * scope.rotationSpeed;
        euler.x -= (movementY / window.innerHeight) * Math.PI / 2  * scope.rotationSpeed;
        euler.x = Math.max( PI_2 - maxPolarAngle, Math.min( PI_2 - minPolarAngle, euler.x ) );

        scope.camera.quaternion.setFromEuler( euler );

    }

    // 鼠标按下时控制方向移动(显示鼠标指针时使用)
    function onMouseDown(event){

        event.preventDefault()

        if (event.button == 0) {

            scope.dom.addEventListener('mousemove', onMouseMove)

            scope.dom.addEventListener('mouseup',onMouseUp)

        }

    }

    function onMouseUp(){

        // 防止鼠标锁定时误触鼠标左键导致清除移动事件
        // 鼠标未处在锁定状态时松开清除移动事件
        if(document.pointerLockElement == null) {

            scope.dom.removeEventListener('mousemove', onMouseMove)

        }

    }

    scope.dom.addEventListener('mousedown', onMouseDown)

    // 前后
    function moveForwardFun ( distance ) {

        /**
         * horizontal状态表示当前相机前后移动时，y轴高度不变，
         * 反之当前移动方向为相机视线焦点，
         * 相机所视方向为自身坐标系原点看向z轴负半轴，up轴默认为y轴
         * */ 
        if ( scope.forwardMode == 'horizontal' ) {

            // 通过矩阵获取相机当前x轴向量
            vec.setFromMatrixColumn( scope.camera.matrix, 0 );

            // 获取相机up轴，求叉积(叉积结果为两向量构成平面的法向量)
            vec.crossVectors( scope.camera.up, vec );

        } else {

            // 当前相机所视方向
            scope.camera.getWorldDirection(vec)

        }
        
        // 在当前方向上进行移动
        scope.camera.position.addScaledVector( vec, distance );

    };

    // 左右
    function moveRightFun ( distance ) {

        vec.setFromMatrixColumn( scope.camera.matrix, 0 );

        scope.camera.position.addScaledVector( vec, distance );

    };

    // 相机上浮
    function up( distance ) {

        // 相对世界坐标的y轴上升
        vec.set(0,1,0)

        scope.camera.position.addScaledVector( vec, distance );

    }

    const onKeyDown = function ( event ) {

        // 键盘放开时将true改为false即可
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'KeyE':
            case 'Space':
                moveUp = true
                break;

            case 'KeyQ':
                moveDown = true
                break;    
        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

            case 'Space':
            case 'KeyE':
                moveUp = false
                break;

            case 'KeyQ':
                moveDown = false
                break;
        }

    };

    window.addEventListener('keydown',onKeyDown)
    window.addEventListener('keyup',onKeyUp)

    // 点击右键锁定鼠标
    document.addEventListener('contextmenu',function(e){ 
        
        e.preventDefault()

        if( document.pointerLockElement == null ) {

            // 锁定指针
            scope.dom.requestPointerLock()

        }
        
    })

    document.addEventListener('pointerlockchange', function(e){

        /**
         * 因为我们有鼠标锁定和未锁定两种状态，而且两种操作方式有一定冲突，
         * 所以在锁定和放开指针时需要解决冲突，也既是事件的绑定和解绑
         * */ 
        if( document.pointerLockElement == null ) {

            scope.dom.removeEventListener('mousemove', onMouseMove)
            scope.dom.addEventListener('mousedown', onMouseDown)

        } else {

            scope.dom.addEventListener('mousemove', onMouseMove)
            scope.dom.removeEventListener('mousedown', onMouseDown)

        }

    })

    // 碰撞检测时根据按键修正当前方向的旋转矩阵
    let matrix = new Matrix4();
    // 当前移动方向
    let direction = new Vector3()
    // 射线查询方向
    let rayDirection = new Vector3()
    // 移动速度
    let velocity = new Vector3()

    // 开启碰撞检测Collision detection
    function animation(){

        if( scope.enableDamping){

            velocity.x -= velocity.x * scope.damping;
            velocity.y -= velocity.y * scope.damping;
            velocity.z -= velocity.z * scope.damping;

        }

        // 判断移动方向
        direction.z = Number(moveForward) - Number(moveBackward)
        direction.y = Number(moveUp) - Number(moveDown)
        direction.x = Number(moveLeft) - Number(moveRight)

        // 向量归一化
        direction.normalize()

        // 碰撞检测
        // 根据键盘同时按下两个时对方向进行修正
        if(direction.z > 0){
            if(direction.x > 0){
                matrix.makeRotationY(Math.PI/4);
            }
            else if(direction.x < 0){
                matrix.makeRotationY(-Math.PI/4);
            }
            else{
                matrix.makeRotationY(0);
            }
        }
        else if(direction.z < 0){
            if(direction.x > 0){
                matrix.makeRotationY(Math.PI/4*3);
            }
            else if(direction.x < 0){
                matrix.makeRotationY(-Math.PI/4*3);
            }
            else{
                matrix.makeRotationY(Math.PI);
            }
        }
        else{
            if(direction.x > 0){
                matrix.makeRotationY(Math.PI/2);
            }
            else if(direction.x < 0){
                matrix.makeRotationY(-Math.PI/2);
            }
        }

        rayDirection.copy(scope.camera.getWorldDirection(new Vector3(0,0,0)).multiply(new Vector3(1, 0, 1)));
         //根据当前前进方向和相机偏移角度水平发射射线==获取运动方向
        rayDirection.applyMatrix4(matrix);

        let horiztialaster = new Raycaster(scope.camera.position,rayDirection,0,scope.CollisionDistance)
        let objs = horiztialaster.intersectObjects(scope.scene.children,true)

        if (objs.length <= 0) {

            if ( moveForward || moveBackward ) {
                velocity.z = 0
                velocity.z -= direction.z * scope.forwardSpeed
    
            }
    
            if(scope.enableDamping) moveForwardFun( - velocity.z * scope.damping )
            else moveForwardFun( - velocity.z )
    
            // 左右
            if ( moveLeft || moveRight ) {
                velocity.x = 0
                velocity.x -= direction.x * scope.asideSpeed
    
            }
    
            if(scope.enableDamping) moveRightFun( velocity.x * scope.damping );
            else moveRightFun( velocity.x );
    
            // 上下
            if( moveUp || moveDown ) {
                velocity.y = 0
                velocity.y += direction.y * scope.upSpeed
    
            }
    
            if(scope.enableDamping) up( velocity.y * scope.damping );
            else up( velocity.y );
            
        }

    }

    // 创建指针
    let pointer = document.createElement('div')
    document.body.appendChild(pointer)
    {
        pointer.style.height = '10px'
        pointer.style.width = '10px'
        pointer.style.borderRadius = '50%'
        pointer.style.border = '1px solid red'
        pointer.style.position = 'absolute'
        pointer.style.top = '50%'
        pointer.style.left = '50%'
        pointer.style.transform = 'translate(-50%,-50%)'
    }
    

    this.update = function(){

        // 判断当前是否处于锁定指针状态
        if(scope.targetPointer && document.pointerLockElement != null) pointer.style.display = 'block' 
        else pointer.style.display = 'none'
        
        // 开启碰撞检测
        if(scope.Collision) {

            animation()
            return

        }
        
        // 开启惯性
        if( scope.enableDamping){

            velocity.x -= velocity.x * scope.damping;
            velocity.y -= velocity.y * scope.damping;
            velocity.z -= velocity.z * scope.damping;

        }

        // 判断移动方向
        direction.z = +moveForward - +moveBackward
        direction.y = +moveUp - +moveDown
        direction.x = +moveLeft - +moveRight

        // 向量归一化
        direction.normalize()

        if ( moveForward || moveBackward ) {
            velocity.z = 0
            velocity.z -= direction.z * scope.forwardSpeed

        }

        if(scope.enableDamping) moveForwardFun( - velocity.z * scope.damping )
        else moveForwardFun( - velocity.z )

        // 左右
        if ( moveLeft || moveRight ) {
            velocity.x = 0
            velocity.x -= direction.x * scope.asideSpeed

        }

        if(scope.enableDamping) moveRightFun( velocity.x * scope.damping );
        else moveRightFun( velocity.x );

        // 上下
        if( moveUp || moveDown ) {
            velocity.y = 0
            velocity.y += direction.y * scope.upSpeed

        }

        if(scope.enableDamping) up( velocity.y * scope.damping );
        else up( velocity.y );

    }
    

}

firstPersonalControl.prototype = Object.create( EventDispatcher.prototype );
firstPersonalControl.prototype.constructor = firstPersonalControl;

export { firstPersonalControl };