import * as THREE from '../../../public/ThreeJS/build/three';

// 棱长/宽度
const EDGE_length = 36;
const EDGE_width = 4;

const CAMERA_distance = EDGE_length * Math.sqrt(10);

// 坐标轴
const AXIS_origin = [-EDGE_length / 2, -EDGE_length / 2, EDGE_length / 2];
const AXIS_length = EDGE_length;
const AXIS_colorMap = {
  x: '#EA4435',
  y: '#34C759',
  z: '#007AFF',
};

// 方体颜色值
const FACE_textColor: any = {
  light: '#333333',
  dark: '#FFFFFF',
};
const HOVER_color: any = {
  light: '#CCE4FF',
  dark: '#385069',
};
const ACTIVE_color: any = {
  light: '#4CA1FF',
  dark: '#1B70C7',
};
const FACE_color: any = {
  light: '#E5E5E5',
  dark: '#363636',
};
const EDGE_color: any = {
  light: '#FFFFFF',
  dark: '#444444',
};
const VERTEX_color: any = {
  light: '#E5E5E5',
  dark: '#363636',
};

// 方体信息
const CUBE_info: any = {
  // 面(英文名，中文名，对应坐标，背景色，国际化缩写名)
  Top: ['Top', '顶', new THREE.Vector3(0, CAMERA_distance, 0), 'T'],
  Bottom: ['Down', '底', new THREE.Vector3(0, -CAMERA_distance, 0), 'D'],
  Front: ['Front', '前', new THREE.Vector3(0, 0, CAMERA_distance), 'F'],
  Back: ['Back', '后', new THREE.Vector3(0, 0, -CAMERA_distance), 'B'],
  Left: ['Left', '左', new THREE.Vector3(-CAMERA_distance, 0, 0), 'L'],
  Right: ['Right', '右', new THREE.Vector3(CAMERA_distance, 0, 0), 'R'],
  // 棱
  FrontUp: ['FrontUp', '前上棱', new THREE.Vector3(0, 0, 1)],
  FrontDown: ['FrontDown', '前下棱', new THREE.Vector3(0, 0, 1)],
  FrontLeft: ['FrontLeft', '前左棱', new THREE.Vector3(0, 0, 1)],
  FrontRight: ['FrontRight', '前右棱', new THREE.Vector3(0, 0, 1)],
  BackUp: ['BackUp', '后上棱', new THREE.Vector3(0, 0, 1)],
  BackDown: ['BackDown', '后下棱', new THREE.Vector3(0, 0, 1)],
  BackLeft: ['BackLeft', '后左棱', new THREE.Vector3(0, 0, 1)],
  BackRight: ['BackRight', '后右棱', new THREE.Vector3(0, 0, 1)],
  LeftUp: ['LeftUp', '左上棱', new THREE.Vector3(0, 0, 1)],
  LeftDown: ['LeftDown', '左下棱', new THREE.Vector3(0, 0, 1)],
  RightUp: ['RightUp', '右上棱', new THREE.Vector3(0, 0, 1)],
  RightDown: ['RightDown', '右下棱', new THREE.Vector3(0, 0, 1)],
  // 顶点
  FrontUpLeft: ['FrontUpLeft', '前上左顶点', new THREE.Vector3(0, 0, 1)],
  FrontUpRight: ['FrontUpRight', '前上右顶点', new THREE.Vector3(1, 0, 1)],
  FrontDownLeft: ['FrontDownLeft', '前下左顶点', new THREE.Vector3(0, 0, 0)],
  FrontDownRight: ['FrontDownRight', '前下右顶点', new THREE.Vector3(1, 0, 0)],
  BackUpLeft: ['BackUpLeft', '后上左顶点', new THREE.Vector3(0, 1, 1)],
  BackUpRight: ['BackUpRight', '后上右顶点', new THREE.Vector3(1, 1, 1)],
  BackDownLeft: ['BackDownLeft', '后下左顶点', new THREE.Vector3(0, 1, 0)],
  BackDownRight: ['BackDownRight', '后下右顶点', new THREE.Vector3(1, 1, 0)],
};

// 面字体大小
const FONT_size_en = (EDGE_length * 2) / 5;
const FONT_size_cn = (EDGE_length * 2) / 3;

export {
  CUBE_info,
  CAMERA_distance,
  FACE_textColor,
  FACE_color,
  EDGE_length,
  EDGE_width,
  EDGE_color,
  VERTEX_color,
  AXIS_origin,
  AXIS_length,
  AXIS_colorMap,
  HOVER_color,
  ACTIVE_color,
  FONT_size_en,
  FONT_size_cn,
};
