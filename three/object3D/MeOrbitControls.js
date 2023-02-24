import {
	EventDispatcher,
	Spherical,
    Vector2,
	Vector3,
    Raycaster,
    Quaternion
} from "./three.module.js";

var MeOrbitControls =  function CustomizeObritControls(camera,scene,domElement){

    if ( domElement === undefined ) console.warn( '渲染所需要的dom元素缺失' );
	if ( domElement === document ) console.error( '请传入renderer渲染对象，而不是整个dom' );

    // dom
    this.dom = domElement
    // 相机
    this.object = camera
    this.scene = scene
    // 相机平移速度
    this.panSpeed = 1
    // 相机焦点位置
    this.target = new Vector3()
    // 左键旋转速度
    this.rotateSpeed = 1
    // 缩放速度
    this.zoomScale = 1
    // 开启惯性
    this.enableDamping = true
    // 惯性系数
    this.dampingFactor = 1

    var scope = this
    // 鼠标按下位置
    var mouseDownX, mouseDownY
    // 球坐标系
    var spherical = new Spherical()
    // 相机焦点到相机位置的向量
    var distanceNormal = new Vector3()
    // 缩放模式///放大或缩小
    var zoomType = 'none'
    // 当前操作模式rotation or pan
    var handleType
    // 阻尼系数旋转角
    var damTheta = 0,damPhi = 0,isRuning = false,isPaning = false
    // 射线查询点击的点
    var point = new Vector3()
    // target 和 点击点之间的四元素
    var quaternion = new Quaternion()

    this.update = function() {
        
        distanceNormal.copy( scope.object.position ).sub( scope.target )

        spherical.setFromVector3( distanceNormal )

        if(zoomType == 'amplification') spherical.radius /= (scope.zoomScale + 0.2 * scope.zoomScale)

        else if (zoomType == 'narrow') spherical.radius *= (scope.zoomScale  + 0.2 * scope.zoomScale)

        zoomType = 'none'

        distanceNormal.setFromSpherical(spherical)

        scope.object.position.copy( scope.target ).add( distanceNormal )
        scope.object.lookAt(scope.target)

    };

    // 鼠标滚轮缩放
    (function(){

        scope.dom.onwheel = function(e){
            e.preventDefault()

            e = e || window.event || window.Event

            if(e.wheelDelta > 0) {

                zoomType = 'amplification'

                scope.panSpeed /= 1.3

            } else {

                zoomType = 'narrow'

                scope.panSpeed *= 1.3

            }
            scope.update()

        }

    }());

    (function(){

        scope.dom.onmousedown = function(e){
            e.preventDefault()

            e = e || window.event || window.Event

            if(e.button == 0) handleType = 'rotation'; else if(e.button == 2) handleType = 'pan'

            mouseDownX = e.clientX
            mouseDownY = e.clientY

            if(scope.enableDamping) isRuning = false

            // 
            if(e.ctrlKey){

                // 获取当前点击点位置
                getRaycasterPoint(e.clientX,e.clientY)

                // scope.target = point
                
            }

            mouseMove()
            mouseUp()
        }

    }());
    function mouseMove() {
        scope.dom.onmousemove = function(e) {

            e = e || window.event || window.Event

            if(scope.enableDamping) isRuning = true

            if (handleType == 'rotation') {

                let theta = ( e.clientX - mouseDownX ) / scope.dom.clientWidth * Math.PI * 2 * scope.rotateSpeed
                let phi = ( e.clientY - mouseDownY ) / scope.dom.clientHeight * Math.PI * 2 * scope.rotateSpeed

                if(scope.enableDamping) {

                    damPhi = phi * scope.dampingFactor
                    damTheta = theta * scope.dampingFactor

                }

                if(e.ctrlKey) {

                    CtrlRotation(theta,phi,point)

                }

                else rotation(theta,phi)

                mouseDownX = e.clientX
                mouseDownY = e.clientY

            } else if (handleType == 'pan') {

                let panX = (e.clientX - mouseDownX) * scope.panSpeed * 0.4
                let panY = (e.clientY - mouseDownY) * scope.panSpeed * 0.4

                let normal = new Vector3()

                normal.setFromMatrixColumn(scope.object.matrix,0)
                normal.multiplyScalar( - panX );
                
                scope.target.add(normal)

                scope.object.position.add(normal)

                normal.setFromMatrixColumn(scope.object.matrix,1)
                normal.multiplyScalar( panY );

                scope.target.add(normal)

                scope.object.position.add(normal)

                mouseDownX = e.clientX
                mouseDownY = e.clientY

                scope.update()
            }

        }

    }

    function rotation(theta,phi) {

        distanceNormal.copy( scope.object.position ).sub( scope.target )

        spherical.setFromVector3( distanceNormal )

        spherical.theta -= theta
        spherical.phi -= phi

        spherical.makeSafe();

        distanceNormal.setFromSpherical(spherical)

        scope.object.position.copy( scope.target ).add( distanceNormal );
        scope.object.lookAt(scope.target)

    }

    function CtrlRotation(theta,phi,point) {

        // 获取相机和target的距离并构造球坐标
        let offset = new Vector3(),sphericalTarget = new Spherical()
        offset.copy( scope.object.position ).sub( scope.target )
        sphericalTarget.setFromVector3( offset )


        // 相机和点击点的球坐标
        distanceNormal.copy( scope.object.position ).sub( point )
        spherical.setFromVector3( distanceNormal )

        spherical.theta -= theta
        spherical.phi -= phi

        spherical.makeSafe();

        distanceNormal.setFromSpherical(spherical)

        scope.object.position.copy( point ).add( distanceNormal );

        // scope.object.lookAt(scope.target)

    }

    function mouseUp(){

        scope.dom.onmouseup = function() {

            scope.dom.onmousemove = null
            
            scope.dom.onmouseup = null

        }
        
    }

    scope.dom.oncontextmenu = function( e ) {

        e.preventDefault()

    }

    function getRaycasterPoint(mouseX,mouseY){

        let raycaster = new Raycaster(),mouse = new Vector2()

        mouse.x = ( mouseX / window.innerWidth ) * 2 - 1
        mouse.y = - ( mouseY / window.innerHeight ) * 2 + 1

        raycaster.setFromCamera( mouse, camera )

        let targets = raycaster.intersectObjects(scene.children,true)

        if (targets[0].point) {

            point = targets[0].point

        } else {

            throw new Error('当前为点击到任何Mesh对象')

        }

    }
}

MeOrbitControls.prototype = Object.create( EventDispatcher.prototype );
MeOrbitControls.prototype.constructor = MeOrbitControls;

export { MeOrbitControls };