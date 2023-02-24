import {

    EventDispatcher,
    Object3D,
    Vector3,
    Vector2,
    Matrix4,
    Spherical,
    Raycaster

} from "./three.module.js"

var AtWillOrbitControls = function (camera, scene, domElement) {

    if (domElement === undefined) console.warn('渲染所需要的dom元素缺失')
    if (domElement === document) console.error('请传入renderer渲染对象，而不是整个dom')

    // 公有变量和函数
    this.camera = camera
    this.scene = scene
    this.dom = domElement
 
    // 操作方式
    this.mapControls = false

    /**
     * 相机默认看向原点(前提条件，camera的up轴为y轴)
     * ps(相机只有一开始看向原点，实际上相机加入obj3D以后每次更新rotationCenter后，相机的target都会更新为rotationCenter)
     * 这样做的好处是我们直接避免了自己更新target时镜头的闪烁问题，threejs自主变换target时不会出现闪烁
     * 
     * */ 
    this.target = new Vector3(0, 0, 0)

    // 构建新的3d对象获取新坐标系
    this.obj3D = new Object3D()
    this.scene.add(this.obj3D)

    // 新坐标系的位置等于旋转中心的位置
    this.obj3D.position.copy(this.target)

    // 旋转速度(接受负数)
    this.rotationSpeedTheta = 1
    this.rotationSpeedPhi = 1

    // 平移速度
    this.panSpeed = 1

    // 极坐标限制(弧度制)
    this.maxPolarAngle = 1.8
    this.minPolarAngle = 0.8 

	// this.minAzimuthAngle = - Infinity; // radians
	// this.maxAzimuthAngle = Infinity; // radians

    // 缩放速度
    this.scaleSpeed = 1.1

    // 限制缩放距离
    this.minDistance = 0;
    this.maxDistance = Infinity


    let scope = this


    // 实时更新相机位置
    this.update = function () {

        //外部更新时，同时设置相机的位置的世界坐标，这里需要copy保存下来
        beforeObj3DWorldPosition.copy(scope.camera.position)

        // 更新相机焦点
        scope.camera.lookAt(scope.target)

        // 更新坐标系和旋转中心
        rotationCenter.copy(scope.target)
        scope.obj3D.position.copy(rotationCenter)

        // 同步相机
        scope.camera.position.sub(scope.obj3D.position)

    }

    // 获取当前相机相对于旋转中心的极坐标
    this.getCoordinates = function () {

        offset.copy(scope.camera.position).sub(scope.obj3D.position)

        spherical.setFromVector3(offset)

        coordinates.theta = spherical.theta
        coordinates.phi = spherical.phi

        return coordinates

    }

    // 销毁当前dom绑定事件并释放相机
    this.dispose = function () {

        scope.dom.removeEventListener('mousemove', onMouseMove);
        scope.dom.removeEventListener('mousedown', onMouseDown);
        scope.dom.removeEventListener('mouseup', onMouseUp);
        scope.dom.removeEventListener('wheel', onWheel);

        // 释放相机
        scope.camera.position.add(scope.obj3D.position)
        scope.scene.add(scope.camera)
        scope.scene.remove(scope.obj3D)

    };

    // 私有变量

    // 鼠标点击时的位置
    let mouseDownX, mouseDownY

    // 旋转缩放中心，也就是obj3D的位置
    let rotationCenter = scope.obj3D.position.clone()

    // 获取相机在加入obj3D之前的世界坐标
    var beforeObj3DWorldPosition = scope.camera.position.clone()

    var coordinates = { phi: 0, theta: 0 }

    // 判断当前操作模式
    let Type = 'none'

    // 标准化三维向量
    var _tempVec3 = new Vector3()

    // mousemove
    let matrix = new Matrix4()
    // 定义初始旋转轴
    let rotationX = new Vector3()
    let rotationY = new Vector3()
    // 平面法向量
    let normal = new Vector3()
    // 相机z轴方向
    let normal1 = new Vector3()
    let offset = new Vector3(), spherical = new Spherical()

    // 相机和目标点之间的距离
    let distance

    // 相机视锥
    var frustum

    // 将相机传进新建坐标系同步位置进行操作
    scope.obj3D.add(scope.camera)

    // 相机的世界坐标等于相机的本地坐标加上父级坐标
    scope.camera.position.sub(scope.obj3D.position)

    let raycaster = new Raycaster(), mouse = new Vector2()

    var onMouseDown = function (e) {

        e.preventDefault()

        scope.dispatchEvent({ type: "mouseDown" })

        if (e.button == 0) Type = "leftClick"
        if (e.button == 2) Type = "rightClick"

        mouseDownX = e.clientX
        mouseDownY = e.clientY

        // 坐标归一化
        mouse.x = (mouseDownX / window.innerWidth) * 2 - 1
        mouse.y = - (mouseDownY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, scope.camera)

        let targets = raycaster.intersectObjects(scope.scene.children, true);

        //按距离从小到大排序，然后再取第一个
        targets.sort((a, b) => {
            return a.distance - b.distance
        })

        // 点击到对象则以点击对象为旋转缩放中心，否则以上次点击点为旋转缩放中心
        if (targets.length && targets[0].point) {

            if (!e.altKey) {

                rotationCenter = targets[0].point

                // 不能在鼠标右键点击时禁用，会造成移动缩放时位置异常(除非移动时旋转中心同步移动)
                scope.obj3D.position.copy(rotationCenter)
                // 相机的世界坐标等于相机局部坐标加obj3D的坐标
                scope.camera.position.copy(beforeObj3DWorldPosition).sub(scope.obj3D.position)

            }

        }

        scope.dom.addEventListener('mousemove', onMouseMove)

        scope.dom.addEventListener('mouseup', onMouseUp)

    }

    var onMouseMove = function (e) {

        scope.dispatchEvent({ type: "mouseMoveStart" })

        e.preventDefault()

        let style = 'none'

        if (!scope.mapControls) {

            if (Type == 'leftClick' && !e.ctrlKey) style = 'rotation'
            if (Type == 'rightClick' && e.ctrlKey) style = 'rotation'

            if (Type == 'leftClick' && e.ctrlKey) style = 'pan'
            if (Type == 'rightClick' && !e.ctrlKey) style = 'pan'

        }

        else {

            if (Type == 'leftClick' && !e.ctrlKey) style = 'pan'
            if (Type == 'rightClick' && e.ctrlKey) style = 'pan'

            if (Type == 'leftClick' && e.ctrlKey) style = 'rotation'
            if (Type == 'rightClick' && !e.ctrlKey) style = 'rotation'

        }


        // 设置theta
        let theta = (e.clientX - mouseDownX) / window.innerWidth * Math.PI * Math.pow(1.5, scope.rotationSpeedTheta)
        let phi = (e.clientY - mouseDownY) / window.innerHeight * Math.PI * Math.pow(1.1, scope.rotationSpeedPhi)

        if (style == 'rotation') {

            /*
                只能以相机自身相对于起始状态的俯仰角来算，不然在移动相机时会造成
                新构建的坐标系的phi会远远大于或远远小于被限制的值
            */

            // 获取世界坐标xz平面法向量
            normal.setFromMatrixColumn(scope.obj3D.matrix, 1)

            // 相机的视角方向
            normal1.setFromMatrixColumn(scope.camera.matrix, 2)

            // 相机由自身坐标系原点看向z轴负半轴，求出z轴与世界平面的夹角既是相机的俯仰角
            let angle = normal.angleTo(normal1)

            if (angle - phi < scope.maxPolarAngle && angle - phi > scope.minPolarAngle) {

                // 俯仰使用相机的x轴，因为相机的视角方向永远垂直与其自身的x轴，在旋转中心找到与之平行的线即为旋转轴
                matrix.makeRotationAxis(rotationX.setFromMatrixColumn(scope.camera.matrix, 0), -phi)

                scope.camera.applyMatrix4(matrix)
                matrix.identity()

            }

            // y轴旋转以obj3D的y轴为准
            matrix.makeRotationAxis(rotationY.setFromMatrixColumn(scope.obj3D.matrix, 1), -theta)
            scope.camera.applyMatrix4(matrix)
            matrix.identity()

            scope.dispatchEvent({ type: "change" })
        }

        else if (style == 'pan') {

            let panX = (e.clientX - mouseDownX) * scope.panSpeed
            let panY = (e.clientY - mouseDownY) * scope.panSpeed

            // let normal = new Vector3()

            // 获取对应轴
            normal.setFromMatrixColumn(scope.camera.matrix, 0)

            // 获取相机x轴方向上的向量
            normal.multiplyScalar(- panX);

            // 同方向上进行加减
            scope.camera.position.add(normal)

            // 非map操作模式下,上下移动为y轴，map操作模式下，上下移动为z轴
            if (scope.mapControls) {

                // map
                normal.setFromMatrixColumn(scope.camera.matrix, 2)
                normal.setY(0)
                normal.multiplyScalar(-panY);

                scope.camera.position.add(normal)

            } else {

                normal.setFromMatrixColumn(scope.camera.matrix, 1)
                normal.multiplyScalar(panY);

                scope.camera.position.add(normal)

            }

            scope.dispatchEvent({ type: "change" })
        }

        // 控制移动为线性运动
        mouseDownX = e.clientX
        mouseDownY = e.clientY

        // 保持相机坐标的统一
        beforeObj3DWorldPosition.copy(scope.camera.position).add(scope.obj3D.position)

        scope.dispatchEvent({ type: "mouseMoveEnd" })

    }

    var onMouseUp = function () {

        scope.dom.removeEventListener('mousemove', onMouseMove)

        scope.dispatchEvent({ type: "mouseUp" })

    }

    scope.dom.addEventListener('mousedown', onMouseDown)

    scope.dom.oncontextmenu = function (e) { e.preventDefault() }

    // 根据距离分级
    let panSpeedLevel = function () {

        distance = _tempVec3.copy(beforeObj3DWorldPosition).sub(rotationCenter).length()

        if (distance > 8000) scope.panSpeed = 9.0
        else if (distance > 7000) scope.panSpeed = 7.0
        else if (distance > 6000) scope.panSpeed = 5.0
        else if (distance > 5000) scope.panSpeed = 4.0
        else if (distance > 3000) scope.panSpeed = 3.0
        else if (distance > 2000) scope.panSpeed = 2.0
        else if (distance > 1500) scope.panSpeed = 1.5
        else if (distance > 1000) scope.panSpeed = 1.0
        else if (distance > 800) scope.panSpeed = 0.7
        else if (distance > 600) scope.panSpeed = 0.6
        else if (distance > 500) scope.panSpeed = 0.5
        else if (distance > 400) scope.panSpeed = 0.4
        else if (distance > 300) scope.panSpeed = 0.3
        else if (distance > 200) scope.panSpeed = 0.22
        else if (distance > 150) scope.panSpeed = 0.18
        else if (distance > 120) scope.panSpeed = 0.15
        else if (distance > 100) scope.panSpeed = 0.1
        else if (distance > 70) scope.panSpeed = 0.07
        else if (distance > 50) scope.panSpeed = 0.06
        else if (distance > 40) scope.panSpeed = 0.08
        else if (distance > 30) scope.panSpeed = 0.06
        else if (distance > 20) scope.panSpeed = 0.04
        else if (distance > 10) scope.panSpeed = 0.02
        else if (distance > 0) scope.panSpeed = 0.01

    }

    panSpeedLevel()


    // 记录当前鼠标位置，防止反复发射射线
    let onWheelPosition = new Vector2()
    // 滚轮缩放
    var onWheel = function (e) {

        e.preventDefault()

        scope.dispatchEvent({ type: "wheelStart" })
        
        // 滚轮滚动时获取当前鼠标指向的位置作为缩放中心
        if(onWheelPosition.x != e.clientX || onWheelPosition.y != e.clientY) {

            mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.y = - (e.clientY / window.innerHeight) * 2 + 1

            raycaster.setFromCamera(mouse, scope.camera)

            let targets = raycaster.intersectObjects(scope.scene.children, true);

            targets.sort((a, b) => {
                return a.distance - b.distance
            })

            if (targets.length && targets[0].point) {

                rotationCenter = targets[0].point

                scope.obj3D.position.copy(rotationCenter)
                scope.camera.position.copy(beforeObj3DWorldPosition).sub(scope.obj3D.position)

            }

            onWheelPosition.set(e.clientX,e.clientY)

        }
        

        if (e.wheelDelta > 0) {

            offset.copy(beforeObj3DWorldPosition).sub(rotationCenter)

            spherical.setFromVector3(offset)

            spherical.radius /= scope.scaleSpeed

            if (spherical.radius < scope.minDistance || spherical.radius > scope.maxDistance) {

                return

            }

            offset.setFromSpherical(spherical)

            scope.camera.position.copy(offset)

            panSpeedLevel()

            scope.dispatchEvent({ type: "change" })

        } else {

            offset.copy(beforeObj3DWorldPosition).sub(rotationCenter)

            spherical.setFromVector3(offset)

            spherical.radius *= scope.scaleSpeed

            if (spherical.radius < scope.minDistance || spherical.radius > scope.maxDistance) {

                return

            }

            offset.setFromSpherical(spherical)

            scope.camera.position.copy(offset)

            panSpeedLevel()

            scope.dispatchEvent({ type: "change" })
        }

        beforeObj3DWorldPosition.copy(scope.camera.position).add(scope.obj3D.position)

        scope.dispatchEvent({ type: "wheelEnd" })

    }

    scope.dom.addEventListener('wheel', onWheel)


    // 移动端事件

    let position1 = new Vector2()
    let position2 = new Vector2()
    let touchStartDistance,touchMoveDistance

    var onTouchStart = function (e) {

        e.preventDefault()

        scope.dispatchEvent({ type: "touchStart" })

        mouseDownX = e.touches[0].clientX
        mouseDownY = e.touches[0].clientY

        if( e.touches.length == 2 ) {

            position1.set( e.touches[0].clientX, e.touches[0].clientY )
            position2.set( e.touches[1].clientX, e.touches[1].clientY )

            touchStartDistance = position1.distanceTo( position2 )

        }

        // 坐标归一化
        mouse.x = (mouseDownX / window.innerWidth) * 2 - 1
        mouse.y = - (mouseDownY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, scope.camera)

        let targets = raycaster.intersectObjects(scope.scene.children, true);

        //按距离从小到大排序，然后再取第一个
        targets.sort((a, b) => {

            return a.distance - b.distance

        })

        // 点击到对象则以点击对象为旋转缩放中心，否则以上次点击点为旋转缩放中心
        if (targets.length && targets[0].point) {

            rotationCenter = targets[0].point

            // 不能在鼠标右键点击时禁用，会造成移动缩放时位置异常(除非移动时旋转中心同步移动)
            scope.obj3D.position.copy(rotationCenter)
            // 相机的世界坐标等于相机局部坐标加obj3D的坐标
            scope.camera.position.copy(beforeObj3DWorldPosition).sub(scope.obj3D.position)

        }

        scope.dom.addEventListener('touchmove', onTouchMove)

        scope.dom.addEventListener('touchend', onTouchEnd)

    }

    var onTouchMove = function (e) {

        scope.dispatchEvent({ type: "mouseMoveStart" })

        e.preventDefault()

        // 设置theta
        let theta = (e.touches[0].clientX - mouseDownX) / window.innerWidth * Math.PI * Math.pow(1.5, scope.rotationSpeedTheta)
        let phi = (e.touches[0].clientY - mouseDownY) / window.innerHeight * Math.PI * Math.pow(1.1, scope.rotationSpeedPhi)

        if (e.touches.length == 1) {

            /*
                只能以相机自身相对于起始状态的俯仰角来算，不然在移动相机时会造成
                新构建的坐标系的phi会远远大于或远远小于被限制的值
            */

            // 获取世界坐标xz平面法向量
            normal.setFromMatrixColumn(scope.obj3D.matrix, 1)

            // 相机的视角方向
            normal1.setFromMatrixColumn(scope.camera.matrix, 2)

            // 相机由自身坐标系原点看向z轴负半轴，求出z轴与世界平面的夹角既是相机的俯仰角
            let angle = normal.angleTo(normal1)

            if (angle - phi < scope.maxPolarAngle && angle - phi > scope.minPolarAngle) {

                // 俯仰使用相机的x轴，因为相机的视角方向永远垂直与其自身的x轴，在旋转中心找到与之平行的线即为旋转轴
                matrix.makeRotationAxis(rotationX.setFromMatrixColumn(scope.camera.matrix, 0), -phi)

                scope.camera.applyMatrix4(matrix)
                matrix.identity()

            }

            // y轴旋转以obj3D的y轴为准
            matrix.makeRotationAxis(rotationY.setFromMatrixColumn(scope.obj3D.matrix, 1), -theta)
            scope.camera.applyMatrix4(matrix)
            matrix.identity()

            // 控制移动为线性运动
            mouseDownX = e.changedTouches[0].clientX
            mouseDownY = e.changedTouches[0].clientY

            scope.dispatchEvent({ type: "change" })
        }

        else if (e.touches.length == 2) {

            position1.set( e.touches[0].clientX, e.touches[0].clientY )
            position2.set( e.touches[1].clientX, e.touches[1].clientY )
            touchMoveDistance = position1.distanceTo( position2 )

            let panX = (e.touches[0].clientX - mouseDownX) * scope.panSpeed
            let panY = (e.touches[0].clientY - mouseDownY) * scope.panSpeed

            // 缩放
            {
                offset.copy(beforeObj3DWorldPosition).sub(rotationCenter)

                spherical.setFromVector3(offset)

                if( touchMoveDistance - touchStartDistance >= 10 ){

                    spherical.radius /= 1.05

                } else if (touchMoveDistance - touchStartDistance < -10) {

                    spherical.radius *= 1.05

                }


                if (spherical.radius < scope.minDistance || spherical.radius > scope.maxDistance) {

                    return

                }

                offset.setFromSpherical(spherical)

                scope.camera.position.copy(offset)

                touchStartDistance = touchMoveDistance

                panSpeedLevel()
            }

            // 平移
            {
                // 获取对应轴
                normal.setFromMatrixColumn(scope.camera.matrix, 0)

                // 获取相机x轴方向上的向量
                normal.multiplyScalar(- panX);

                // 同方向上进行加减
                scope.camera.position.add(normal)

                normal.setFromMatrixColumn(scope.camera.matrix, 1)
                normal.multiplyScalar(panY);

                scope.camera.position.add(normal)
            }
            
            // 控制移动为线性运动
            mouseDownX = e.touches[0].clientX
            mouseDownY = e.touches[0].clientY

            scope.dispatchEvent({ type: "change" })
        }

        // 保持相机坐标的统一
        beforeObj3DWorldPosition.copy(scope.camera.position).add(scope.obj3D.position)

        scope.dispatchEvent({ type: "touchMoveEnd" })

    }

    var onTouchEnd = function () {

        scope.dom.removeEventListener('touchmove', onTouchMove)

        scope.dispatchEvent({ type: "touchEnd" })

    }

    scope.dom.addEventListener('touchstart', onTouchStart)

}

AtWillOrbitControls.prototype = Object.create(EventDispatcher.prototype);
AtWillOrbitControls.prototype.constructor = AtWillOrbitControls;

export { AtWillOrbitControls };