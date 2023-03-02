import { MapModeType } from '@/constants/mapState';
import { Languages } from '@/locales';
import { TWEEN } from '../../../public/ThreeJS/examples/jsm/libs/tween.module.min.js';
import * as THREE from '../../../public/ThreeJS/build/three';
import { OrbitControls } from '../../../public/ThreeJS/examples/jsm/controls/OrbitControls';
import { getScene3DRange, setModelView } from '@/map-tools/mapSettings';
import { EDGE_length as edge, CAMERA_distance } from './cubeInfo';
import { getId } from '@/utils/parse';
import { renderMap } from '@/map-tools/layerUtil';
import { adjustBoundingSphereOffset, offsetFromHeadingPitchRange } from '@/map-tools/caculateUtils';

/**
 * 3j初始化
 * @param {HTMLElement} domNode 挂载render的dom
 */
function initThreeJS(domNode: any) {
  const threeViewer = window.__MAP[getId()][MapModeType.MODE_CUBE];
  // init renderer
  threeViewer.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) as any;
  threeViewer.renderer.setPixelRatio(window.devicePixelRatio);
  threeViewer.renderer.setSize(120, 120); //设置宽和高
  domNode.appendChild(threeViewer.renderer.domElement);

  // init secen
  threeViewer.scene = new THREE.Scene();
  // init camera
  threeViewer.camera = new THREE.PerspectiveCamera(
    45,
    1, // window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  threeViewer.camera.position.set(CAMERA_distance, CAMERA_distance, CAMERA_distance);

  // 创建自然光源
  const ambientLight = new THREE.AmbientLight('#ffffff');
  threeViewer.scene.add(ambientLight);

  threeViewer.controls = new OrbitControls(threeViewer.camera, threeViewer.renderer.domElement);
  threeViewer.controls.enablePan = false; // 禁用平移
  threeViewer.controls.enableZoom = false; // 是否允许缩放
  threeViewer.controls.minDistance = 1; //设置相机移动距离
  // threeViewer.controls.maxDistance = 2000;
  // 锁定立方体旋转(不可旋转)
  // threeViewer.controls.enableRotate = false;

  // 解除垂直旋转180°限制
  // threeViewer.controls.addEventListener('change', () => {
  //   // 获取当前旋转垂直角度
  //   const polarAngle = threeViewer.controls.getPolarAngle();
  //   // 设置颠倒视图
  //   if (polarAngle < 0.0001) {
  //     threeViewer.camera.up.y = 1;
  //   } else if (polarAngle > 3.14) {
  //     threeViewer.camera.up.y = -1;
  //   }
  // });
}
// 渲染更新
function reRender() {
  try {
    if (window.__MAP[getId()]?.[MapModeType.MODE_CUBE]) {
      const { renderer, scene, camera, controls } = window.__MAP[getId()][MapModeType.MODE_CUBE];
      scene && camera && renderer.render(scene, camera);
      controls && controls.update();
      // TWEEN.update();
      requestAnimationFrame(reRender);
    }
  } catch (error) {
    console.error('reRender Failed');
  }
}

/**
 * 立方体初始化
 * @param {string} id
 * @param {Object} cubeInfoMap 立方体常量
 * @param {string} faceColor 面颜色
 * @param {string} faceTextColor 面文字颜色
 * @param {string} edgeColor 棱面颜色
 * @param {string} vertexColor 顶点面颜色
 * @param {number} edgeLength 边长/棱
 * @param {number} edgeWidth 边缘宽度/棱宽度
 * @param {string} language 语言
 */
function cubeInitialize(
  id: string,
  cubeInfoMap: any,
  faceColor: string,
  faceTextColor: string,
  edgeColor: string,
  vertexColor: string,
  edgeLength: number,
  edgeWidth: number,
  language: string,
) {
  freeUp(window.__MAP[id][MapModeType.MODE_CUBE]);

  createFace(id, edgeLength, edgeWidth, faceColor, faceTextColor, cubeInfoMap, language);
  createEdge(id, edgeLength, edgeWidth, edgeColor);
  createVertex(id, edgeLength, edgeWidth, vertexColor);
}

/**
 * 创建面 -- BufferGeometry + canvas绘制
 * @param {string} id
 * @param {number} edgeLength 边长/棱
 * @param {number} edgeWidth 边缘宽度/棱宽度
 * @param {string} faceColor 面颜色
 * @param {string} faceTextColor 面文字颜色
 * @param {Object} cubeInfoMap 颜色信息
 * @param {string} language 语言
 */
function createFace(
  id: string,
  edgeLength: number,
  edgeWidth: number,
  faceColor: string,
  faceTextColor: string,
  cubeInfoMap: any,
  language: string,
) {
  const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];
  const halfEdgeLength = edgeLength / 2;
  const side = halfEdgeLength - edgeWidth;

  const faceGeometry = new THREE.BufferGeometry();
  const faceVertices = new Float32Array(
    [
      -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,

      1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    ].map((value, index) => {
      if (index % 3 === 2) return value * halfEdgeLength;
      return value * side;
    }),
  );

  // (u, 1 - v)
  const uvs = new Float32Array([
    0, 1, 0, 0, 1, 1,

    1, 1, 0, 0, 1, 0,
  ]);

  faceGeometry.setAttribute('position', new THREE.BufferAttribute(faceVertices, 3));
  faceGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  // 创建面mesh
  createFaceMesh('Front', faceGeometry, '', 0);
  createFaceMesh('Back', faceGeometry, 'Y', Math.PI);
  createFaceMesh('Left', faceGeometry, 'Y', -Math.PI / 2);
  createFaceMesh('Right', faceGeometry, 'Y', Math.PI / 2);
  createFaceMesh('Top', faceGeometry, 'X', -Math.PI / 2);
  createFaceMesh('Bottom', faceGeometry, 'X', Math.PI / 2);

  /**
   * 创建面mesh
   * @param faceName 面名称
   * @param faceGeometry 面几何对象
   * @param faceRotateAxis 旋转轴
   * @param faceRotateAngle 旋转角度
   */
  function createFaceMesh(
    faceName: string,
    faceGeometry: any,
    faceRotateAxis = '',
    faceRotateAngle = 0,
  ) {
    const faceText =
      language === Languages.ZH_CN ? cubeInfoMap[faceName][1] : cubeInfoMap[faceName][0];
    const fontWeight = language === Languages.ZH_CN ? '500' : 'bold';
    const fontSize = language === Languages.ZH_CN ? (edge * 2) / 3 : (edge * 2) / 5;
    const fontFamily = language === Languages.ZH_CN ? 'PingFangSC-Medium' : 'HelveticaNeue-Medium';
    const texture = new THREE.CanvasTexture(
      drawCanvasTexture({
        canvasWidth: edge,
        canvasHeight: edge,
        textString: faceText,
        fontWeight,
        fontSize,
        fontFamily,
        backgroundColor: faceColor,
        textColor: faceTextColor,
      }),
    );
    texture.anisotropy = threeViewer.renderer?.capabilities.getMaxAnisotropy() || 8;
    window.__MAP[id][MapModeType.MODE_CUBE].boxTextures.push(texture);
    const canvasMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      // color: faceColor,
      side: THREE.DoubleSide,
    });
    texture.needsUpdate = true; // 下次使用纹理时触发一次更新。 这对于设置包裹模式尤其重要
    // canvasMaterial.map = texture;
    const faceMesh: any = new THREE.Mesh(faceGeometry, canvasMaterial);
    // 对faceMesh绕轴旋转
    meshRotate(faceMesh, faceRotateAxis, faceRotateAngle);
    faceMesh.name = faceName;
    faceMesh.meshType = 'face';
    window.__MAP[id][MapModeType.MODE_CUBE].scene.add(faceMesh);
    window.__MAP[id][MapModeType.MODE_CUBE].boxFaces.push(faceMesh);
  }
}

/**
 * 创建棱面
 * @param {string} id
 * @param {number} edgeLength 棱长(棱面长)
 * @param {number} edgeWidth 棱宽(棱面宽)
 * @param {string | number} edgeColor 棱/棱面材质颜色
 */
function createEdge(id: string, edgeLength: number, edgeWidth: number, edgeColor: string | number) {
  const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];

  createEdgeMesh('FrontUp', [0, 1, 1], 'Z', Math.PI / 2); // 前-上棱
  createEdgeMesh('FrontDown', [0, -1, 1], 'XZ', [Math.PI / 2, Math.PI / 2]); // 前-下棱
  createEdgeMesh('FrontLeft', [-1, 0, 1], 'Y', -Math.PI / 2); // 前-左棱
  createEdgeMesh('FrontRight', [1, 0, 1]); // 前-右棱
  createEdgeMesh('BackUp', [0, 1, -1], 'XZ', [-Math.PI / 2, Math.PI / 2]); // 后-上棱
  createEdgeMesh('BackDown', [0, -1, -1], 'XZ', [Math.PI, Math.PI / 2]); // 后-下棱

  createEdgeMesh('BackLeft', [1, 0, -1], 'X', Math.PI); // 后-左棱
  createEdgeMesh('BackRight', [-1, 0, -1], 'XY', [Math.PI, -Math.PI / 2]); // 后-右棱
  createEdgeMesh('LeftUp', [-1, 1, 0], 'XY', [Math.PI / 2, Math.PI]); // 左-上棱
  createEdgeMesh('LeftDown', [-1, -1, 0], 'XY', [Math.PI / 2, -Math.PI / 2]); // 左-下棱
  createEdgeMesh('RightUp', [1, 1, 0], 'XY', [Math.PI / 2, Math.PI / 2]); // 右-上棱
  createEdgeMesh('RightDown', [1, -1, 0], 'X', Math.PI / 2); // 右-下棱

  /**
   * 创建棱面mesh
   * @param edgeName 棱名称
   * @param rotateAxis 旋转轴
   * @param rotateAngle 旋转角度
   */
  function createEdgeMesh(
    edgeName: string,
    edgePosition: Array<number>,
    rotateAxis = '',
    rotateAngle: number | Array<number> = 0,
  ) {
    const edgeRadius = edgeWidth;
    const edgeCenterLenght = edgeLength / 2 - edgeRadius;
    const edgeGeometry = new THREE.CylinderGeometry(
      edgeRadius,
      edgeRadius,
      edgeCenterLenght * 2,
      32,
      1,
      true,
      0,
      Math.PI / 2,
    );
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: edgeColor,
      // side: THREE.DoubleSide,
    });
    const edgeMesh: any = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edgeMesh.position.set(
      edgePosition[0] * edgeCenterLenght,
      edgePosition[1] * edgeCenterLenght,
      edgePosition[2] * edgeCenterLenght,
    );
    meshRotate(edgeMesh, rotateAxis, rotateAngle);
    edgeMesh.name = edgeName;
    edgeMesh.meshType = 'edge';
    threeViewer.scene.add(edgeMesh);
    threeViewer.boxEdges.push(edgeMesh);
  }
}

/**
 * 创建顶点面
 * @param {string} id
 * @param {number} edgeLength 棱长(棱面长)
 * @param {number} edgeWidth 棱宽(棱面宽)
 * @param {string | number} vertexColor 顶点颜色
 */
function createVertex(id: string, edgeLength: number, edgeWidth: number, vertexColor: any) {
  const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];

  createVertexMesh('FrontUpLeft', [-1, 1, 1]); // 前-左-上点
  createVertexMesh('FrontUpRight', [1, 1, 1]); // 前-右-上点
  createVertexMesh('FrontDownLeft', [-1, -1, 1]); // 前-左-下点
  createVertexMesh('FrontDownRight', [1, -1, 1]); // 前-右-下点
  createVertexMesh('BackUpLeft', [1, 1, -1]); // 后-左-上点
  createVertexMesh('BackUpRight', [-1, 1, -1]); // 后-右-上点
  createVertexMesh('BackDownLeft', [1, -1, -1]); // 后-左-下点
  createVertexMesh('BackDownRight', [-1, -1, -1]); // 后-右-下点

  /**
   * 创建顶点面mesh
   * @param vertexName 棱名称
   * @param vertexPosition 旋转轴
   */
  function createVertexMesh(vertexName: string, vertexPosition: Array<number>) {
    const radius = edgeWidth * Math.sin(Math.PI / 2);
    const vertexCenterLenght = edgeLength / 2 - radius;
    const phiStart = 0;
    const phi = Math.PI * 2; // Math.PI / 2;
    const theta = Math.PI; // Math.PI / 2;
    const vertexGeometry = new THREE.SphereGeometry(radius, 32, 16, phiStart, phi, 0, theta);
    const vertexMaterial = new THREE.MeshBasicMaterial({
      color: vertexColor,
      // side: THREE.DoubleSide,
    });
    const vertexMesh: any = new THREE.Mesh(vertexGeometry, vertexMaterial);
    vertexMesh.position.set(
      vertexPosition[0] * vertexCenterLenght,
      vertexPosition[1] * vertexCenterLenght,
      vertexPosition[2] * vertexCenterLenght,
    );
    vertexMesh.name = vertexName;
    vertexMesh.meshType = 'vertex';
    threeViewer.scene.add(vertexMesh);
    threeViewer.boxVertexs.push(vertexMesh);

    // 添加对应顶点热区(透明的范围球)
    const vertexHotZoneGeometry = new THREE.SphereGeometry(
      radius + 3,
      32,
      16,
      phiStart,
      phi,
      0,
      theta,
    );
    const vertexHotZoneMaterial = new THREE.MeshBasicMaterial({
      color: vertexColor,
      transparent: true,
      opacity: 0,
      // side: THREE.DoubleSide,
    });
    const vertexHotZoneMesh: any = new THREE.Mesh(vertexHotZoneGeometry, vertexHotZoneMaterial);
    vertexHotZoneMesh.position.set(
      vertexPosition[0] * vertexCenterLenght,
      vertexPosition[1] * vertexCenterLenght,
      vertexPosition[2] * vertexCenterLenght,
    );
    vertexHotZoneMesh.name = `${vertexName}-HotZone`;
    vertexHotZoneMesh.meshType = 'vertex';
    threeViewer.scene.add(vertexHotZoneMesh);
    threeViewer.boxVertexs.push(vertexHotZoneMesh);
  }
}

// 平面棱
function createEdgePlane(id: string, edgeLength: number, edgeWidth: number, edgeColor: string) {
  // const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];
  const halfEdgeLength = edgeLength / 2;
  const side = halfEdgeLength - edgeWidth;

  // 水平棱--平行x轴的四条棱，以前上棱为基准旋转得到前下、后上、后下
  /**
   * 前上棱--几何
   * (-1, 1.1, 1) (1, 1.1, 1)
   * (-1, 1, 1.1) (1, 1, 1.1)
   */
  const horizalEdgeGeometry = new THREE.BufferGeometry();
  const horizalEdgeVertices = new Float32Array(
    [
      -1, 1.1, 1, -1, 1, 1.1, 1, 1.1, 1,

      1, 1.1, 1, -1, 1, 1.1, 1, 1, 1.1,
    ].map((value) => {
      return (value > 0 ? 1 : -1) * (Math.abs(value) > 1 ? halfEdgeLength : side);
    }),
  );
  horizalEdgeGeometry.setAttribute('position', new THREE.BufferAttribute(horizalEdgeVertices, 3));

  // 垂直棱--垂直
  /**
   * 前左棱--几何
   * (-1.1, 1, 1)  (-1, 1, 1.1)
   * (-1.1, -1, 1)  (-1, -1, 1.1)
   */
  const verticalEdgeGeometry = new THREE.BufferGeometry();
  const verticalhorizalEdgeVertices = new Float32Array(
    [
      -1.1, 1, 1, -1.1, -1, 1, -1, 1, 1.1,

      -1, 1, 1.1, -1.1, -1, 1, -1, -1, 1.1,
    ].map((value) => {
      return (value > 0 ? 1 : -1) * (Math.abs(value) > 1 ? halfEdgeLength : side);
    }),
  );
  verticalEdgeGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(verticalhorizalEdgeVertices, 3),
  );

  createEdgeMesh('FrontUp', horizalEdgeGeometry, edgeColor); // 前-上棱
  createEdgeMesh('FrontDown', horizalEdgeGeometry, edgeColor, 'X', Math.PI / 2); // 前-下棱
  createEdgeMesh('BackUp', horizalEdgeGeometry, edgeColor, 'X', -Math.PI / 2); // 后-上棱
  createEdgeMesh('BackDown', horizalEdgeGeometry, edgeColor, 'X', Math.PI); // 后-下棱

  createEdgeMesh('FrontLeft', verticalEdgeGeometry, edgeColor); // 前-左棱
  createEdgeMesh('FrontRight', verticalEdgeGeometry, edgeColor, 'Y', Math.PI / 2); // 前-右棱
  createEdgeMesh('BackLeft', verticalEdgeGeometry, edgeColor, 'Y', Math.PI); // 后-左棱
  createEdgeMesh('BackRight', verticalEdgeGeometry, edgeColor, 'Y', -Math.PI / 2); // 后-右棱

  createEdgeMesh('LeftUp', horizalEdgeGeometry, edgeColor, 'Y', -Math.PI / 2); // 左-上棱
  // createEdgeMesh('LeftDown', horizalEdgeGeometry, edgeColor, 'YX', [(-Math.PI / 2), (Math.PI / 2)]); // 左下棱: 前上棱绕Y旋转-90°得到左上，再绕X轴旋转90°后得到
  createEdgeMesh('LeftDown', verticalEdgeGeometry, edgeColor, 'X', Math.PI / 2); // 左-下棱
  createEdgeMesh('RightUp', horizalEdgeGeometry, edgeColor, 'Y', Math.PI / 2); // 右-上棱
  createEdgeMesh('RightDown', horizalEdgeGeometry, edgeColor, 'YX', [Math.PI / 2, Math.PI / 2]); // 右-下棱：前上棱绕Y旋转90°得到前下，再绕X轴旋转-90°后得到

  /**
   * 创建棱面mesh
   * @param edgeName 棱名称
   * @param edgeGeometry 棱几何对象
   * @param edgeColor 棱背景色
   * @param rotateAxis 旋转轴
   * @param rotateAngle 旋转角度
   */
  function createEdgeMesh(
    edgeName: string,
    edgeGeometry: any,
    edgeColor: string,
    rotateAxis = '',
    rotateAngle: number | Array<number> = 0,
  ) {
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: edgeColor,
      side: THREE.DoubleSide,
    });
    const edgeMesh: any = new THREE.Mesh(edgeGeometry, edgeMaterial);
    meshRotate(edgeMesh, rotateAxis, rotateAngle);
    edgeMesh.name = edgeName;
    edgeMesh.meshType = 'edge';
    window.__MAP[id][MapModeType.MODE_CUBE].scene.add(edgeMesh);
    window.__MAP[id][MapModeType.MODE_CUBE].boxEdges.push(edgeMesh);
  }
}
// 平面顶点
function createVertexPlane(id: string, edgeLength: number, edgeWidth: number, vertexColor: any) {
  // const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];
  const halfEdgeLength = edgeLength / 2;
  const side = halfEdgeLength - edgeWidth;

  const vertexGeometry = new THREE.BufferGeometry();
  // 前-左-上角顶点 (-1, 1, 1.1) (-1, 1.1, 1) (-1.1, 1, 1)
  const vertextFaceVertices = new Float32Array(
    [-1, 1, 1.1, -1, 1.1, 1, -1.1, 1, 1].map((value) => {
      return (value > 0 ? 1 : -1) * (Math.abs(value) > 1 ? halfEdgeLength : side);
    }),
  );

  vertexGeometry.setAttribute('position', new THREE.BufferAttribute(vertextFaceVertices, 3));

  // console.log('顶点：', vertextFaceVertices, vertexGeometry);

  createVertexMesh('FrontUpLeft', vertexGeometry, vertexColor); // 前-左-上点
  createVertexMesh('FrontUpRight', vertexGeometry, vertexColor, 'Y', Math.PI / 2); // 前-右-上点
  createVertexMesh('FrontDownLeft', vertexGeometry, vertexColor, 'X', Math.PI / 2); // 前-左-下点
  createVertexMesh('FrontDownRight', vertexGeometry, vertexColor, 'YX', [Math.PI / 2, Math.PI / 2]); // 前-右-下点
  createVertexMesh('BackUpLeft', vertexGeometry, vertexColor, 'Y', Math.PI); // 后-左-上点
  createVertexMesh('BackUpRight', vertexGeometry, vertexColor, 'X', -Math.PI / 2); // 后-右-上点
  createVertexMesh('BackDownLeft', vertexGeometry, vertexColor, 'YX', [Math.PI, Math.PI / 2]); // 后-左-下点
  createVertexMesh('BackDownRight', vertexGeometry, vertexColor, 'YX', [-Math.PI / 2, Math.PI / 2]); // 后-右-下点

  /**
   * 创建顶点面mesh
   * @param vertexName 顶点名
   * @param vertexGeometry 顶点几何对象
   * @param vertexMaterial 顶点材质
   * @param rotateAxis 旋转轴
   * @param rotateAngle 旋转角度
   */
  function createVertexMesh(
    vertexName: string,
    vertexGeometry: any,
    vertexColor: string | number,
    rotateAxis = '',
    rotateAngle: number | Array<number> = 0,
  ) {
    const vertexMaterial = new THREE.MeshBasicMaterial({
      color: vertexColor,
      side: THREE.DoubleSide,
    });
    const vertexMesh: any = new THREE.Mesh(vertexGeometry, vertexMaterial);
    meshRotate(vertexMesh, rotateAxis, rotateAngle);
    vertexMesh.name = vertexName;
    vertexMesh.meshType = 'vertex';
    window.__MAP[id][MapModeType.MODE_CUBE].scene.add(vertexMesh);
    window.__MAP[id][MapModeType.MODE_CUBE].boxVertexs.push(vertexMesh);
  }
}

/**
 * mesh绕轴旋转函数
 * @param {Mesh} mesh 旋转mesh
 * @param {string} rotateAxis 旋转轴
 * @param {number | Array<number>} rotateAngle 旋转角度
 * @returns mesh
 */
function meshRotate(mesh: any, rotateAxis: any, rotateAngle: any) {
  // switch (rotateAxis) {
  //   case 'X': {
  //     mesh.rotateX(Array.isArray(rotateAngle) ? rotateAngle[0] : rotateAngle);
  //     break;
  //   }
  //   case 'Y': {
  //     mesh.rotateY(Array.isArray(rotateAngle) ? rotateAngle[0] : rotateAngle);
  //     break;
  //   }
  //   case 'Z': {
  //     mesh.rotateZ(Array.isArray(rotateAngle) ? rotateAngle[0] : rotateAngle);
  //     break;
  //   }
  //   case 'XY': {
  //     mesh.rotateX(Array.isArray(rotateAngle) ? rotateAngle[0] : rotateAngle);
  //     mesh.rotateY(Array.isArray(rotateAngle) ? rotateAngle[1] : rotateAngle);
  //     break;
  //   }
  //   case 'XZ': {
  //     mesh.rotateX(Array.isArray(rotateAngle) ? rotateAngle[0] : rotateAngle);
  //     mesh.rotateZ(Array.isArray(rotateAngle) ? rotateAngle[1] : rotateAngle);
  //     break;
  //   }
  //   case 'YZ': {
  //     mesh.rotateY(Array.isArray(rotateAngle) ? rotateAngle[0] : rotateAngle);
  //     mesh.rotateZ(Array.isArray(rotateAngle) ? rotateAngle[1] : rotateAngle);
  //     break;
  //   }
  //   default: {
  //     break;
  //   }
  // }

  const rotateMap: any = {
    X: mesh.rotateX,
    Y: mesh.rotateY,
    Z: mesh.rotateZ,
    XY: (angle: Array<number>) => {
      mesh.rotateX(angle[0]);
      mesh.rotateY(angle[1]);
    },
    XZ: (angle: Array<number>) => {
      mesh.rotateX(angle[0]);
      mesh.rotateZ(angle[1]);
    },
    YZ: (angle: Array<number>) => {
      mesh.rotateY(angle[0]);
      mesh.rotateZ(angle[1]);
    },
  };
  rotateAxis && rotateMap[rotateAxis].call(mesh, rotateAngle);
  return mesh;
}

/**
 * 坐标轴初始化
 * @param {Array<number>} originPoint 原点
 * @param {number} axisLength 轴长
 * @param {number | string} axisColor 轴颜色
 * @param {number} labelSize 标签尺寸-默认棱长一半
 */
function axisInit(originPoint: Array<number>, axisLength: number, axisColor: any, labelSize = 17) {
  const threeViewer = window.__MAP[getId()][MapModeType.MODE_CUBE];
  // xyz标签
  const xyzLabelMesh: any = new THREE.Mesh();

  // 使用精灵Sprite创建xyz标签
  const xLabel: any = createTextSprite('x', 48, axisColor.x, 'rgb(0, 0, 0, 0)');
  xLabel.name = 'xLabel';
  xLabel.position.set(axisLength + 6, 0, 0);
  xLabel.scale.set(labelSize, labelSize, 0);
  xyzLabelMesh.add(xLabel);

  const yLabel: any = createTextSprite('y', 48, axisColor.y, 'rgb(0, 0, 0, 0)');
  yLabel.name = 'yLabel';
  yLabel.position.set(0, axisLength + 6, 0);
  yLabel.scale.set(labelSize, labelSize, 0);
  xyzLabelMesh.add(yLabel);

  const zLabel: any = createTextSprite('z', 48, axisColor.z, 'rgb(0, 0, 0, 0)');
  zLabel.name = 'zLabel';
  zLabel.position.set(0, 0, axisLength + 6);
  zLabel.scale.set(labelSize, labelSize, 0);
  xyzLabelMesh.add(zLabel);

  // 使用CSS2D创建xyz标签
  // const xAxesDiv = document.createElement('div'); // x轴标签
  // xAxesDiv.className = 'xlabel';
  // xAxesDiv.textContent = 'x';
  // xAxesDiv.style.background = 'none';
  // xAxesDiv.style.color = 'red';
  // const xlabel = new CSS2DObject(xAxesDiv) as any;
  // xlabel.position.set(edge * 1.2 + 1, 0, 0);
  // xyzLabelMesh.add(xlabel);
  // const yAxesDiv = document.createElement('div'); // y轴标签
  // yAxesDiv.className = 'ylabel';
  // yAxesDiv.textContent = 'y';
  // yAxesDiv.style.background = 'none';
  // yAxesDiv.style.color = 'green';
  // const ylabel = new CSS2DObject(yAxesDiv) as any;
  // ylabel.position.set(0, edge * 1.2 + 1, 0);
  // xyzLabelMesh.add(ylabel);
  // const zAxesDiv = document.createElement('div'); // z轴标签
  // zAxesDiv.className = 'zlabel';
  // zAxesDiv.textContent = 'z';
  // zAxesDiv.style.background = 'none';
  // zAxesDiv.style.color = 'blue';
  // const zlabel = new CSS2DObject(zAxesDiv) as any;
  // zlabel.position.set(0, 0, edge * 1.2 + 1);
  // xyzLabelMesh.add(zlabel);

  // xyz轴
  const topRadius = 0.8,
    bottomRadius = 0.8,
    segments = 32;
  const axisGeometry = new THREE.CylinderGeometry(topRadius, bottomRadius, axisLength, segments);
  axisGeometry.translate(0, 2, 0);

  const xMaterial: any = new THREE.MeshStandardMaterial({
    color: axisColor.x,
  });
  const xAxis: any = new THREE.Mesh(axisGeometry, xMaterial);
  xAxis.name = 'xAxis';
  xAxis.meshType = 'Axis';
  xAxis.position.set(-2, -edge / 2, edge / 2);
  xAxis.rotateZ(-Math.PI / 2);
  threeViewer.scene.add(xAxis);
  threeViewer.boxAixes.push(xAxis);

  const yMaterial: any = new THREE.MeshStandardMaterial({
    color: axisColor.y,
  });
  const yAxis: any = new THREE.Mesh(axisGeometry, yMaterial);
  yAxis.name = 'yAxis';
  yAxis.meshType = 'Axis';
  yAxis.position.set(-edge / 2, -edge / 2, 2);
  yAxis.rotateX(-Math.PI / 2);
  threeViewer.scene.add(yAxis);
  threeViewer.boxAixes.push(yAxis);

  const zMaterial: any = new THREE.MeshStandardMaterial({
    color: axisColor.z,
  });
  const zAxis: any = new THREE.Mesh(axisGeometry, zMaterial);
  zAxis.name = 'zAxis';
  zAxis.meshType = 'Axis';
  zAxis.position.set(-edge / 2, -2, edge / 2);
  threeViewer.scene.add(zAxis);
  threeViewer.boxAixes.push(zAxis);

  xyzLabelMesh.rotateX(-Math.PI / 2);
  xyzLabelMesh?.position.set(originPoint[0], originPoint[1], originPoint[2]);
  xyzLabelMesh.name = 'xyz';
  threeViewer.scene.add(xyzLabelMesh); // 网格模型添加到场景中
  threeViewer.boxAixes.push(xyzLabelMesh);
}

/**
 * 绘制canvas纹理
 * @param options
 * @returns canvas
 */
function drawCanvasTexture(options: any) {
  const {
    canvasWidth = 36,
    canvasHeight = 36,
    textString = '字',
    fontWeight = '500',
    fontSize = canvasWidth / 2,
    fontFamily = 'PingFangSC-Medium',
    backgroundColor = '#E5E5E5',
    textColor = '#000000',
  } = options;
  const canvas = document.createElement('canvas');
  const ctx: any = canvas.getContext('2d');

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  // 获取文字高度
  const textHeight = ctx.measureText(textString).actualBoundingBoxDescent / 2;
  ctx.fillText(textString, canvasWidth / 2, (canvasHeight + textHeight) / 2, canvasWidth);
  // ctx.strokeStyle = textColor;
  // ctx.strokeText(textString, padding, baseline);
  return canvas;
}

/**
 * 创建文字标签-精灵
 * @param {string} textString 文本
 * @param {string | number} textSize 文本大小
 * @param {string | number} textColor 文本颜色
 * @param {string | number} backgroundColor 背景色
 * @returns sprite实例
 */
function createTextSprite(
  textString: string,
  textSize = 14,
  textColor: string | number = 'red',
  backgroundColor: string | number = '',
) {
  const canvas = document.createElement('canvas');
  const ctx: any = canvas.getContext('2d');
  const width = 128;
  const height = 128;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `bold ${textSize}px Arial`;
  // ctx.lineWidth = 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // ctx.strokeStyle = textColor;
  // ctx.strokeText(textString, width / 2, height / 2);
  ctx.fillStyle = textColor;
  ctx.fillText(textString, width / 2, height / 2, width);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}

/**
 * 相机动画
 * @param cameraCurrent 相机当前位置
 * @param cameraTarget 相机的目标位置
 */
// function setCubeView (
//   cameraCurrent: { x: number; y: number; z: number },
//   cameraTarget: { x: number; y: number; z: number },
// ) {
//   const threeViewer = window.__MAP[getId()][MapModeType.MODE_CUBE];
//   threeViewer.tween = new TWEEN.Tween(cameraCurrent)
//     .to(cameraTarget, 300) // 设置比模型旋转动画多100ms，为了解决底面旋转朝向以及抖动问题
//     .onUpdate(function (e: any) {
//       // threeViewer.camera.position.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
//       // threeViewer.camera.lookAt(0, 0, 0);
//       // threeViewer.controls.target.set(0, 0, 0);
//       threeViewer.controls.update();
//     })
//     .easing(TWEEN.Easing.Cubic.In)
//     .start();
// };

/**
 * 获取射线相交对象
 * @param {THREE.Vector2} mouse 二维平面位置
 * @param {THREE.Raycaster} raycaster 射线对象
 * @param {MouseEvent} e 屏幕位置
 * @param {Array} target 检查与射线相交的物体
 * @returns 相交对象
 */
function getSelectObj(
  mouse: THREE.Vector2,
  raycaster: THREE.Raycaster,
  e: { clientX: number; clientY: number },
  target: any,
) {
  const { renderer, camera, scene } = window.__MAP[getId()][MapModeType.MODE_CUBE];
  // 屏幕坐标x、y
  const Sx = e.clientX;
  const Sy = e.clientY;
  // 计算three画布距离左侧和上侧窗口(实际可视窗)的边距
  const offsetX = renderer.domElement.getBoundingClientRect().left;
  const offsetY = renderer.domElement.getBoundingClientRect().top;
  // 画布真实宽高
  const canvasWidth = renderer.domElement.clientWidth;
  const canvasHeight = renderer.domElement.clientHeight;
  //将html坐标系转化为webgl坐标系，并确定鼠标点击位置
  mouse.x = ((Sx - offsetX) / canvasWidth) * 2 - 1;
  mouse.y = -((Sy - offsetY) / canvasHeight) * 2 + 1;
  //以camera为z坐标，确定所点击物体的3D空间位置
  raycaster.setFromCamera(mouse, camera);
  //确定所点击位置上的物体数量
  const intersects = raycaster.intersectObjects(target || scene.children, true);
  return intersects;
}

/**
 * 重设mesh材质颜色
 * @param {Mesh} mesh mesh对象
 * @param {string | number} color 颜色
 * @param {boolean} isTexture 是否纹理材质的mesh
 * @param {Object} texture 纹理贴图
 * @returns boolean 是否设置成功
 */
function resetMeshColor(mesh: any, color: string | number, isTexture = false, texture: any) {
  let result = false;
  if (mesh && mesh?.material) {
    // 非纹理贴图材质
    if (!isTexture) {
      mesh.material.color.set(new THREE.Color(color));
    } else {
      texture && (mesh.material.map = texture);
      mesh.material.map.needsUpdate = true;
    }
    result = true;
  }
  return result;
}

/**
 * 设置拾取mesh中顶点、棱、面的优先级
 * @param {Array} intersects 拾取的mesh数组
 * @param {string} priorityType 优先级类型
 * @returns 对应的数组下标
 */
function pickMeshPriority(intersects: any, priorityType: string) {
  let vertexIndex = 0;
  try {
    for (const i in intersects) {
      if (intersects[i]?.object.meshType === priorityType) {
        vertexIndex = Number(i);
        throw new Error();
      }
    }
  } catch (error) {}

  return vertexIndex;
}

/**
 * 监听3D模型相机变化以控制立方体
 * @param {string} id
 */
function cesiumCameraChanged(id: string) {
  const map3D = window.__MAP[id][MapModeType.MODE_3D];
  const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];
  const { scene, camera, layerManager } = map3D;
  // const threeViewer = window.__MAP[getId()][MapModeType.MODE_CUBE];
  // 监听方案一：camera.changed，问题：不能修改相机参数
  // camera?.changed.addEventListener(cameraChangeCallback);
  // camera.percentageChanged = 0.01; // 修改会影响其他的地方

  // 监听方案二：scene.preRender，问题：因为实时渲染会一直触发
  let flag: any = null;
  scene.preRender.addEventListener((scene: any, time: any) => {
    // if (map3D.isPressed) cameraChangeCallback(camera, layerManager);
    const { position } = camera;
    if (flag && flag === position?.x && threeViewer.isOperateCube) return;
    flag = position.x;
    cameraChangeCallback(camera, layerManager);
  });

  function cameraChangeCallback(camera: any, layerManager: any) {
    // 首先将坐标转为ENU坐标系，然后计算 极坐标->点坐标 得到点位置xyz，使用矩阵y_up-z_up转换为three的坐标，
    // 归一化后再乘以相机距离即为最终相机位置
    const { heading, pitch, roll, positionWC } = camera;

    // 使用cesium相机位置计算3j相机位置
    // const { center: modelCenter } = getScene3DRange(layerManager); // 实时计算模型中心
    // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
    // const modelInverseMatrix = Cesium.Matrix4.inverse(modelMatrix, new Cesium.Matrix4());
    // const transfromPosition = Cesium.Matrix4.multiplyByPoint(
    //   modelInverseMatrix,
    //   positionWC,
    //   new Cesium.Cartesian3(),
    // );
    // 将局部坐标zup->yup
    // const matrixX = Cesium.Matrix3.fromRotationX(-Cesium.Math.PI_OVER_TWO);
    // const threeCameraPosition = Cesium.Matrix3.multiplyByVector(
    //   matrixX,
    //   transfromPosition,
    //   new Cesium.Cartesian3(),
    // );
    // const normalizePosition = Cesium.Cartesian3.normalize(
    //   threeCameraPosition,
    //   new Cesium.Cartesian3(),
    // );
    // controlThreeCamera(normalizePosition);

    // 根据模型中心坐标和相机hpr计算世界矩阵
    const hprToPosition = new Cesium.Cartesian3(
      -Math.sin(heading) * Math.cos(pitch),
      -Math.cos(heading) * Math.cos(pitch),
      -Math.sin(pitch),
    );
    const matrixX = Cesium.Matrix3.fromRotationX(-Cesium.Math.PI_OVER_TWO);
    const threeCameraPosition = Cesium.Matrix3.multiplyByVector(
      matrixX,
      hprToPosition,
      new Cesium.Cartesian3(),
    );
    const normalizePosition = Cesium.Cartesian3.normalize(
      threeCameraPosition,
      new Cesium.Cartesian3(),
    );
    controlThreeCamera(normalizePosition);
  }
}

/**
 * 控制three相机变化
 * @param {Object} position 坐标对象包含xyz属性
 */
function controlThreeCamera(position: any) {
  const threeViewer = window.__MAP[getId()][MapModeType.MODE_CUBE];
  // threeViewer.camera.matrixAutoUpdate = false;
  threeViewer.camera.position.set(
    position.x * CAMERA_distance,
    position.y * CAMERA_distance,
    position.z * CAMERA_distance,
  );
  threeViewer.controls.update();
}

/**
 * 监听立方体相机变化控制3D模型
 * @param id
 */
function threeCameraChanged(id: string) {
  const map3D = window.__MAP[id][MapModeType.MODE_3D];
  const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];
  threeViewer.controls.addEventListener('change', () => {
    if (map3D.isPressed) return;
    if (threeViewer.isOperateCube && !map3D.isPressed) cameraChangedCallback();
  });

  function cameraChangedCallback() {
    // 归一化normalize
    const position = threeViewer.camera.position;
    const normalizePosition = {
      x: position.x / CAMERA_distance,
      y: position.y / CAMERA_distance,
      z: position.z / CAMERA_distance,
    };

    // 反转Y to Z
    const matrixX = Cesium.Matrix3.fromRotationX(Cesium.Math.PI_OVER_TWO);
    const ceisumCameraPosition = Cesium.Matrix3.multiplyByVector(
      matrixX,
      normalizePosition,
      new Cesium.Cartesian3(),
    );

    // x = -sinH*cosP, y = -cosH*cosP, z = -sinP; 根据xyz位置逆推HeadingPitchRoll；
    const pitch = -Cesium.Math.asinClamped(ceisumCameraPosition.z);
    let heading = -Cesium.Math.asinClamped(ceisumCameraPosition.x / Math.cos(pitch));
    // heading从“前”顺时针，区间为[0,90]↑、[90,0]↓、[0,-90]↓、[-90,0]↑
    // 应为[0-360]↑，故需做特殊区间处理以保持一致
    if (ceisumCameraPosition.y > 0) {
      // 递减区间取反设为递增
      heading = -heading + Math.PI;
    }
    if (ceisumCameraPosition.x > 0 && ceisumCameraPosition.y < 0) {
      heading += Math.PI * 2;
    }
    // console.log(
    //   'HeadingPitchRoll',
    //   Cesium.Math.toDegrees(heading),
    //   Cesium.Math.toDegrees(pitch),
    //   0.0,
    // );

    // 控制Cesium相机变化
    setModelView(
      id,
      MapModeType.MODE_3D,
      'vector',
      [heading, pitch, 0.0],
      1,
      false,
      0.3,
      ceisumCameraPosition,
    );
  }
}

/**
 * 释放资源
 * @param threeViewer three对象
 */
function freeUp(threeViewer: any) {
  try {
    disposeFunc(threeViewer.scene, threeViewer.boxFaces);
    disposeFunc(threeViewer.scene, threeViewer.boxEdges);
    disposeFunc(threeViewer.scene, threeViewer.boxVertexs);
    disposeFunc(threeViewer.scene, threeViewer.boxTextures);
    threeViewer.boxFaces = [];
    threeViewer.boxEdges = [];
    threeViewer.boxVertexs = [];
    threeViewer.boxTextures = [];
  } catch (error) {
    console.error('FreeUp Cube Failed.');
  }
}

/**
 * 释放内存资源(主要是几何体、材质、纹理)
 * @param {*} scene three场景
 * @param {Array} targetArr 需要释放资源的数组(Mesh和Texture纹理)
 */
function disposeFunc(scene: any, targetArr: any) {
  try {
    if (targetArr) {
      targetArr.forEach((item: any) => {
        if (item?.isCanvasTexture) {
          scene.remove(item);
          item.dispose();
        } else {
          scene.remove(item);
          item.geometry.dispose();
          item.material.dispose();
        }
      });
    }
  } catch (error) {
    console.error('disposeFunc Failed.');
  }
}

export {
  initThreeJS,
  cubeInitialize,
  axisInit,
  createFace,
  createEdge,
  createVertex,
  reRender,
  resetMeshColor,
  pickMeshPriority,
  freeUp,
  getSelectObj,
  drawCanvasTexture,
  cesiumCameraChanged,
  threeCameraChanged,
};
