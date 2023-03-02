import React, { useRef, useState } from 'react';
import './index.less';
import * as THREE from '../../../public/ThreeJS/build/three';
import { MapModeType } from '@/constants/mapState';
import { useRecoilValue } from 'recoil';
import { mapState } from '@/components/project/store';
import { languageState, themeState } from '@/store';
import {
  initThreeJS,
  // reRender,
  axisInit,
  cubeInitialize,
  cesiumCameraChanged,
  threeCameraChanged,
  resetMeshColor,
  getSelectObj,
  freeUp,
  drawCanvasTexture,
} from '@/components/rotateCube/threeUtils';
import {
  EDGE_length,
  EDGE_width,
  AXIS_colorMap,
  AXIS_origin,
  AXIS_length,
  CUBE_info,
  FACE_textColor,
  HOVER_color,
  ACTIVE_color,
  EDGE_color,
  FACE_color,
  VERTEX_color,
  FONT_size_en,
  FONT_size_cn,
} from './cubeInfo';
import { setModelView } from '@/map-tools/mapSettings';
import { Languages } from '@/locales';

function RotateCube(props: any) {
  const { id } = props;
  const { mode } = useRecoilValue(mapState);
  const theme = useRecoilValue(themeState);
  const language = useRecoilValue(languageState);
  const cubeContainerRef = useRef(null);

  const mouseInfo = useRef({
    dbclick: false,
    start: 0,
    end: 0,
  });
  const threeViewerRef = useRef({
    isOperateCube: false,
  });
  let clickTimer = null as any;
  let activeTimer = null as any;
  let hoverMesh: any = null; // 处于悬浮态的Mesh

  // 解决新建项目时mode没生效问题
  const mapStateRef: any = useRef({});
  React.useEffect(() => {
    mapStateRef.current = { mode };
  }, [mode]);

  React.useEffect(() => {
    try {
      !window.__MAP[id] && (window.__MAP[id] = { rotateCube: null });
      window.__MAP[id][MapModeType.MODE_CUBE] = {
        renderer: null as any,
        scene: null as any,
        camera: null as any,
        controls: null as any,
        tween: null as any,
        boxAixes: [] as any,
        boxFaces: [] as any,
        boxEdges: [] as any,
        boxVertexs: [] as any,
        boxTextures: [] as any,
      };
      threeViewerRef.current = window.__MAP[id][MapModeType.MODE_CUBE];

      initThreeJS(cubeContainerRef.current);
      cubeInitialize(
        id,
        CUBE_info,
        FACE_color[theme],
        FACE_textColor[theme],
        EDGE_color[theme],
        VERTEX_color[theme],
        EDGE_length,
        EDGE_width,
        language,
      );
      axisInit(AXIS_origin, AXIS_length, AXIS_colorMap, EDGE_length);
      reRender();
      cesiumCameraChanged(id);
      threeCameraChanged(id);
    } catch (err) {
      console.error('RotateCube Init Failed.');
    }

    const cubeDom = window.__MAP[id][MapModeType.MODE_CUBE].renderer.domElement;
    cubeAddListener(cubeDom);
    return () => {
      cubeRemoveListener(cubeDom);
      freeUp(threeViewerRef.current);
    };
  }, [id]);

  React.useEffect(() => {
    cubeInitialize(
      id,
      CUBE_info,
      FACE_color[theme],
      FACE_textColor[theme],
      EDGE_color[theme],
      VERTEX_color[theme],
      EDGE_length,
      EDGE_width,
      language,
    );

    // 必须重新监听，否则切换后鼠标悬浮颜色还是上一次的监听
    const threeViewer = window.__MAP[id][MapModeType.MODE_CUBE];
    const cubeDom = threeViewer.renderer.domElement;
    cubeRemoveListener(cubeDom);
    cubeAddListener(cubeDom);
    return () => {
      cubeRemoveListener(cubeDom);
      freeUp(threeViewer);
    };
  }, [theme, language]);

  // 渲染更新
  function reRender() {
    try {
      if (window.__MAP[id]?.[MapModeType.MODE_CUBE]) {
        const { renderer, scene, camera, controls } = window.__MAP[id][MapModeType.MODE_CUBE];
        scene && camera && renderer.render(scene, camera);
        controls && controls.update();
        // TWEEN.update();
        requestAnimationFrame(reRender);
      }
    } catch (error) {
      console.error('reRender Failed');
    }
  }

  // 监听
  function cubeAddListener(cubeDom: any) {
    cubeDom.addEventListener('mousedown', handleMouseDown);
    cubeDom.addEventListener('mouseup', handleMouseUp);
    cubeDom.addEventListener('mousemove', hoverCubeFunc);
    cubeDom.addEventListener('click', handleClick);
    cubeDom.addEventListener('dblclick', resetCubeView);
  }
  function cubeRemoveListener(cubeDom: any) {
    cubeDom.addEventListener('mousedown', handleMouseDown);
    cubeDom.addEventListener('mouseup', handleMouseUp);
    cubeDom.addEventListener('mousemove', hoverCubeFunc);
    cubeDom.removeEventListener('click', handleClick);
    cubeDom.removeEventListener('dblclick', resetCubeView);
  }
  function handleMouseDown(e: any) {
    mouseInfo.current.start = +new Date();
    // 是否操作立方体
    threeViewerRef.current.isOperateCube = true;
  }
  function handleMouseUp(e: any) {
    mouseInfo.current.end = +new Date();
    // 是否操作立方体
    threeViewerRef.current.isOperateCube = false;
  }

  // 判断单击和双击事件
  function handleClick(e: any) {
    mouseInfo.current.dbclick = false;
    // down和up间隔500ms以上则认为不是单击，区分move
    if (mouseInfo.current.end - mouseInfo.current.start > 500) return;
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    // 区分单击与双击
    clickTimer = setTimeout(() => {
      if (mouseInfo.current.dbclick) return;
      mouseClick(e);
    }, 250);
  }

  // 监听点击事件
  function mouseClick(e: { clientX: number; clientY: number }) {
    const { boxVertexs } = window.__MAP[id][MapModeType.MODE_CUBE];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const intersects = getSelectObj(mouse, raycaster, e, null);
    // console.log('intersects', intersects);
    if (intersects.length > 0) {
      let currentMesh =
        intersects[0]?.object?.type === 'Mesh' && intersects[0]?.object?.meshType !== 'Axis'
          ? intersects[0]
          : intersects[1];

      // 扩大顶点点击热区
      if (currentMesh?.object.name.includes('-HotZone')) {
        const name = currentMesh?.object.name.split('-HotZone')[0];
        try {
          boxVertexs.forEach((item: any, index: number) => {
            if (item.name === name) {
              currentMesh = { object: boxVertexs[index] };
              throw new Error();
            }
          });
        } catch (error) {
          // console.log('ClickCubeFunc Traverse Catch');
        }
      }

      const name = currentMesh?.object?.name;
      if (name && CUBE_info.hasOwnProperty(name)) {
        setModelView(id, mapStateRef.current.mode, 'string', name);
        // setCubeView(threeViewer.camera.position, CUBE_info[name][2]);
        clickCubeFunc(currentMesh);
      } else {
        console.log('点击的是坐标轴');
      }
    } else {
      console.log('请点击立方体');
    }
  }

  // 双击还原
  function resetCubeView(e: any) {
    mouseInfo.current.dbclick = true;
    const intersects = getSelectObj(new THREE.Vector2(), new THREE.Raycaster(), e, null);
    const currentMesh = intersects[0]?.object?.type === 'Mesh' ? intersects[0] : intersects[1];
    if (currentMesh?.object?.type === 'Mesh') {
      setModelView(id, mapStateRef.current.mode, 'vector', [
        Cesium.Math.toRadians(-45),
        Cesium.Math.toRadians(-38),
        Cesium.Math.toRadians(0),
      ]);
      // setModelView(id, mapStateRef.current.mode, 'string', 'FrontUpRight');
      // setCubeView(threeViewer.camera.position, CUBE_info['FrontUpRight'][2]);
    }
  }

  // 悬浮态
  function hoverCubeFunc(e: { clientX: number; clientY: number }) {
    const { boxFaces, boxEdges, boxVertexs } = window.__MAP[id][MapModeType.MODE_CUBE];
    // 判断相交数组包括面、棱、顶点
    const intersectMeshArr = [...boxFaces, ...boxEdges, ...boxVertexs];
    const intersects = getSelectObj(
      new THREE.Vector2(),
      new THREE.Raycaster(),
      e,
      intersectMeshArr,
    );
    // console.log('intersects', intersects);

    if (intersects.length > 0) {
      if (intersects[0]?.object?.isMesh) {
        // 移除前一个
        if (intersects[0]?.object?.name !== hoverMesh?.object?.name) {
          let resetColor = FACE_color[theme];
          hoverMesh?.object?.meshType === 'edge' && (resetColor = EDGE_color[theme]);
          hoverMesh?.object?.meshType === 'vertex' && (resetColor = VERTEX_color[theme]);
          hoverMesh && setCubeMeshColor(hoverMesh?.object, resetColor);
        }
        hoverMesh = intersects[0];
        // 筛选热区对应的顶点
        if (intersects[0]?.object.name.includes('-HotZone')) {
          const name = intersects[0]?.object.name.split('-HotZone')[0];
          try {
            boxVertexs.forEach((item: any, index: number) => {
              if (item.name === name) {
                hoverMesh = { object: boxVertexs[index] };
                throw new Error();
              }
            });
          } catch (error) {
            // console.log('HoverCubeFunc Traverse Catch');
          }
        }
        setCubeMeshColor(hoverMesh?.object, HOVER_color[theme]);
      }
    } else {
      if (hoverMesh && hoverMesh?.object) {
        let resetColor = FACE_color[theme];
        hoverMesh?.object?.meshType === 'edge' && (resetColor = EDGE_color[theme]);
        hoverMesh?.object?.meshType === 'vertex' && (resetColor = VERTEX_color[theme]);
        setCubeMeshColor(hoverMesh?.object, resetColor);
        hoverMesh = null;
      }
    }
  }

  // 点击态
  function clickCubeFunc(clickMesh: any) {
    setCubeMeshColor(clickMesh?.object, ACTIVE_color[theme]);

    // 点击态需要旋转完成时消失
    if (activeTimer) {
      clearTimeout(activeTimer);
      activeTimer = null;
    }
    activeTimer = setTimeout(() => {
      let resetColor = FACE_color[theme];
      clickMesh?.object.meshType === 'edge' && (resetColor = EDGE_color[theme]);
      clickMesh?.object.meshType === 'vertex' && (resetColor = VERTEX_color[theme]);
      setCubeMeshColor(clickMesh?.object, resetColor);
    }, 300);
  }

  // 定制化立方体各mesh颜色
  function setCubeMeshColor(mesh: any, color: string) {
    const name = mesh?.name;
    const faceText = language === Languages.ZH_CN ? CUBE_info[name][1] : CUBE_info[name][0];
    const fontSize = language === Languages.ZH_CN ? FONT_size_cn : FONT_size_en;

    if (mesh.meshType === 'face') {
      const resetTexture = new THREE.CanvasTexture(
        drawCanvasTexture({
          textString: faceText,
          backgroundColor: color,
          textColor: FACE_textColor[theme],
          fontSize,
        }),
      );
      resetTexture.anisotropy =
        window.__MAP[id][MapModeType.MODE_CUBE].renderer?.capabilities.getMaxAnisotropy() || 8;
      resetMeshColor(mesh, color, true, resetTexture);
    } else {
      resetMeshColor(mesh, color, false, null);
    }
  }

  return (
    <div>
      <div
        ref={cubeContainerRef}
        className="m-canvas-cube"
        id=""
        style={{ display: mode === MapModeType.MODE_3D ? 'block' : 'none' }}
      ></div>
    </div>
  );
}
export default React.memo(RotateCube);
