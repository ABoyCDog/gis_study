
import autel3d from "autel3d/index";
import { GUI } from "../../resources/libs/lil-gui.module.min.js";
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOTVjZjQ4Zi1lNDU3LTQzZTgtOTcxMy0wMjZjYjFjNTU3ZDMiLCJpZCI6MTA3OTI1LCJpYXQiOjE2NjMxMjE1Nzh9.ELSD4E5cAHclXpL4PxAFvVcrMFbvzfF8B3QQF_K7res';

const gui = new GUI({ name: "影像底图" });
gui.domElement.style.setProperty("left", "20px");
gui.domElement.style.setProperty("top", "20px");

const BaseMapType = {
  "谷歌卫星影像": autel3d.ImageryMapType.GOOGLE_IMAGERY,
  "谷歌电子地图": autel3d.ImageryMapType.GOOGLE_VECTOR,
  "天地图卫星影像": autel3d.ImageryMapType.TDT_IMAGERY,
  "天地图电子地图": autel3d.ImageryMapType.TDT_VECTOR,
  "天地图标记": autel3d.ImageryMapType.TDT_VECTOR_MARK,
  "高德卫星影像": autel3d.ImageryMapType.GD_IMAGERY,
  "高德电子地图": autel3d.ImageryMapType.GD_VECTOR,
  "ARCGIS_STREET": autel3d.ImageryMapType.ARCGIS_STREET,
  "OpenStreet矢量图": autel3d.ImageryMapType.OPENSTREET_VECTOR,
  "Mapbox影像图": autel3d.ImageryMapType.MapBoxMap_IMAGERY,
  "Mapbox矢量图": autel3d.ImageryMapType.MapBoxMap_VECTOR,
  "无影像": autel3d.ImageryMapType.NONE,
};
const baseMapNames = Object.keys(BaseMapType);

const tilingScheme = new Cesium.WebMercatorTilingScheme({
});
// const rectangle = Cesium.Rectangle.fromDegrees(114.1647511876257113,22.7013829176784689, 114.1714581569274003,22.7109869573077283, new Cesium.Rectangle());

// const rectangle = Cesium.Rectangle.fromDegrees(113.99687094997107, 22.595433372439473, 113.99994035185728, 22.59864947269896, new Cesium.Rectangle());

// 航测10
// const rectangle = Cesium.Rectangle.fromDegrees(114.18975866971076, 22.761031596412973, 114.19338200259419, 22.76556425878168, new Cesium.Rectangle());
// const projectId = "0b1370a4-0c80-4f98-b2f3-7f47f7a08041";
// const taskId = "6a7dcb20-1e7d-4015-9d69-02b390dce369";

const rectangle = Cesium.Rectangle.fromDegrees(114.16519902565629, 22.7017105766131, 114.17099126684735, 22.710652231142994, new Cesium.Rectangle());
const projectId = "ea7e3597-8a44-43fa-8630-40d3cbfabe74";
const taskId = "8cb214f1-f9c7-4d4b-9560-860bcbb260e3";
const params = {
  helperLayer_show: true,
  baseMapType: baseMapNames[10],
  // left_url: "http://10.250.12.245:8099/Data/Data2D/map",
  left_url: "http://10.250.12.245:8099/Data/Data2D/tile-dsm",
  // left_url: "http://10.250.12.245:8099/Data/Data2D/tile",
  left_show: true,
  left_applyGray: false,
  minHeight: 0,
  maxHeight: 100,

  right_url: `http://10.250.12.245:26887/${projectId}/task/${taskId}/tile`,
  // right_url: "http://10.250.12.245:8099/Data/Data2D/tile_autel",
  right_show: true,

  zoomFactor: 5,

  reloadLeftLayer: () => {
    addLeft3DLayer()
  },
  reloadRightLayer: () => {
    addRight3DLayer();
  },
  zoomToLayer: () => {
    left2DLayer?.zoomToRange();
  },
  debugShowBoundingVolume: false,
  maximumScreenSpaceError: 16,
  showSkybox: false,
  showTerrain: false,
  maxLevel: 22,
  markShow: true,
}
const viewer = new autel3d.Map("mapContainer", {
  sceneMode: Cesium.SceneMode.SCENE2D,
  baseMapType: BaseMapType[params.baseMapType],
  baseMapToken: '9bcf98afb2f754d1ebfd3dfd08e3848a'
});

window.map = viewer;
const scene = viewer.scene;
scene.debugShowFramesPerSecond = true;
let left2DLayer, right2DLayer;
const layerManager = viewer.layerManager;
const leftLayerId = "leftTiles";
const rightLayerId = "rightTiles";

// const coodHelpLayer = viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider({
//   tilingScheme: tilingScheme,
//   show: params.helperLayer_show,
//   maximumLevel: 18,
// }));

const { east, north, west, south } = tilingScheme.tileXYToRectangle(1712663, 913379, 21, new Cesium.Rectangle());
const side = Math.max(
  Cesium.Cartesian3.distance(
    Cesium.Cartesian3.fromRadians(east, north),
    Cesium.Cartesian3.fromRadians(west, north),
  ),
  Cesium.Cartesian3.distance(
    Cesium.Cartesian3.fromRadians(east, north),
    Cesium.Cartesian3.fromRadians(east, south),
  )
)
console.log(side, Math.ceil(side * 2));
scene.screenSpaceCameraController.minimumZoomDistance = 17 * Math.pow(2, 23 - params.maxLevel);
const addTilePrimitive = (x, y, level) => {
  const material = new Cesium.Material({
    fabric: {
      type: 'Image',
      uniforms: {
        image: `http://10.250.12.245:26887/zhiyuan_test/task/7c868327-2284-429b-b460-d31eeae051d7/tile/${level}/${x}/${y}.png`,
      },
    },
    minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
    magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
  })
  scene.primitives.add(
    new Cesium.GroundPrimitive({
      geometryInstances: [new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: tilingScheme.tileXYToRectangle(x, y, level, new Cesium.Rectangle()),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
      })],
      appearance: new Cesium.MaterialAppearance({
        material: material,
        closed: false
      })
    })
  );
}


// addTilePrimitive(1712663, 913379, 21)
// addTilePrimitive(1712664, 913379, 21)

const slider = document.getElementById("slider");
scene.splitPosition = slider.offsetLeft / slider.parentElement.offsetWidth;

const handler = new Cesium.ScreenSpaceEventHandler(slider);

let moveActive = false;

function move(movement) {
  if (!moveActive) {
    return;
  }

  const relativeOffset = movement.endPosition.x;
  const splitPosition =
    (slider.offsetLeft + relativeOffset) /
    slider.parentElement.offsetWidth;
  slider.style.left = `${100.0 * splitPosition}%`;
  scene.splitPosition = splitPosition;
}

handler.setInputAction(function () {
  moveActive = true;
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
handler.setInputAction(function () {
  moveActive = true;
}, Cesium.ScreenSpaceEventType.PINCH_START);

handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

handler.setInputAction(function () {
  moveActive = false;
}, Cesium.ScreenSpaceEventType.LEFT_UP);
handler.setInputAction(function () {
  moveActive = false;
}, Cesium.ScreenSpaceEventType.PINCH_END);

let baseMinHeight = params.minHeight,
baseMaxHeight = params.maxHeight,
baseHeightRange = baseMaxHeight - baseMinHeight;
const addLeft3DLayer = (ifZoomTo = false) => {
  left2DLayer && layerManager.removeLayer(leftLayerId);
  Cesium.Resource.fetchJson({
    url: params.left_url + "/2d_tile.json",
  }).then((res) => {
    const { depth_range } = res;
    if (depth_range.length === 2){
      params.minHeight = baseMinHeight = Math.round(depth_range[0] * 1000) / 1000;
      params.maxHeight = baseMaxHeight = Math.round(depth_range[1] * 1000) / 1000;
      baseHeightRange = baseMaxHeight - baseMinHeight;
      minHeightController.max(baseMaxHeight);
      minHeightController.min(baseMinHeight);
      maxHeightController.max(baseMaxHeight);
      maxHeightController.min(baseMinHeight);
    }
  });
  layerManager.addLayer(autel3d.LayerType.IMAGERY, leftLayerId, {
    mapType: autel3d.ImageryMapType.URL_IMAGERY,
    url: params.left_url + "/{z}/{x}/{y}.png",
    rectangle,
    tilingScheme: tilingScheme,
    minimumLevel: 12,
    maximumLevel: 21,
    applyGray: params.applyGray,
    grayGradient: new Cesium.ColorGradient([
      {
        value: 0,
        color: Cesium.Color.fromCssColorString("#F78C50")
      },
      {
        value: 0.45,
        color: Cesium.Color.fromCssColorString("#EFF9A6")
      },
      {
        value: 0.69,
        color: Cesium.Color.fromCssColorString("#58B3AA")
      },
      {
        value: 1.0,
        color: Cesium.Color.fromCssColorString("#5A55A5")
      }
    ]),
    show: params.left_show
  }).then((layer) => {
    ifZoomTo && layer.zoomToRange();
    left2DLayer = layer;
    left2DLayer.mapLayer.splitDirection = Cesium.SplitDirection.LEFT;
    window.left2DLayer = left2DLayer.mapLayer;
  });
}

const addRight3DLayer = (ifZoomTo = false) => {
  right2DLayer && layerManager.removeLayer(rightLayerId);
  layerManager.addLayer(autel3d.LayerType.IMAGERY, rightLayerId, {
    mapType: autel3d.ImageryMapType.URL_IMAGERY,
    url: params.right_url + "/{z}/{x}/{y}.png",
    rectangle,
    tilingScheme: tilingScheme,
    minimumLevel: 12,
    maximumLevel: 21,
    splitDirection: Cesium.SplitDirection.RIGHT,
    show: params.right_show,
    // magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
    // minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
  }).then((layer) => {
    ifZoomTo && layer.zoomToRange();
    right2DLayer = layer;
    right2DLayer.mapLayer.splitDirection = Cesium.SplitDirection.RIGHT;
    // right2DLayer.mapLayer.hue =2.0
  });
}

addLeft3DLayer(true);
addRight3DLayer(true);

gui.add(params, "helperLayer_show")
  .name("坐标网格图层")
  .onChange((value) => {
    coodHelpLayer && (coodHelpLayer.show = value);
  })
gui.add(params, "maxLevel")
  .name("缩放层级限制")
  .max(25)
  .min(1)
  .step(1)
  .onChange((value) => {
    scene.screenSpaceCameraController.minimumZoomDistance = 17 * Math.pow(2, 23 - value);
  })
const leftFolder = gui.addFolder("左侧图层属性");

leftFolder.add(params, "left_url")
  .name("左侧地址");
leftFolder.add(params, "reloadLeftLayer")
  .name("重新加载左侧3DTiles");
leftFolder.add(params, "left_show")
  .name("图层显隐")
  .onChange((value) => {
    left2DLayer && (left2DLayer.show = value);
  })
leftFolder.add(params, "left_applyGray")
  .name("灰度着色")
  .onChange((value) => {
    // left2DLayer && (left2DLayer.mapLayer.applyGray = value);
    left2DLayer && (left2DLayer.applyGray = value);
    // right2DLayer && (right2DLayer.mapLayer.applyGray = value);
  })
const minHeightController = gui.add(params, "minHeight")
  .name("最小高度")
  .max(1000)
  .min(-200)
  .step(0.001)
  .listen()
  .onChange((value) => {
    left2DLayer && (left2DLayer.minimumGray = (value - baseMinHeight) / baseHeightRange);
  });
  
const maxHeightController = gui.add(params, "maxHeight")
  .name("最大高度")
  .max(2000)
  .min(0)
  .step(.001)
  .listen()
  .onChange((value) => {
    left2DLayer && (left2DLayer.maximumGray =  (value - baseMinHeight) / baseHeightRange);
  });

const rightFolder = gui.addFolder("右侧图层属性");

rightFolder.add(params, "right_url")
  .name("右侧地址");
rightFolder.add(params, "reloadRightLayer")
  .name("重新加载右侧3DTiles");
rightFolder.add(params, "right_show")
  .name("图层显隐")
  .onChange((value) => {
    right2DLayer && (right2DLayer.show = value);
  })
let dsmPrimitive
gui.add(params, "markShow")
  .name("标记显隐")
  .onChange((value) => {
    dsmPrimitive && (dsmPrimitive.show = value);
  })
gui.add(params, "zoomToLayer")
  .name("初始位置")

function addTile(x, y, level) {
  Cesium.Resource.fetchImage({
    url: `http://10.250.12.245:8099/Data/Data2D/tile-dsm/${level}/${x}/${y}.png`,
  }).then((image) => {
  
    const dsmMaterial = new Cesium.Material({
      fabric: {
        type: 'DSM',
        uniforms: {
          // u_image: "http://10.250.12.245:8099/Data/Data2D/DSM/677855.png",
          u_image: image,
          u_bottomColor: Cesium.Color.RED,
          u_topColor: Cesium.Color.BLUE,
          u_alpha: 1.0
        },
        source: `
          float sdfBox(vec2 p, vec2 size, float radius) {
            vec2 d = abs(p) - size + radius;
            return length(max(d, 0.)) + min(max(d.x, d.y), 0.0) - radius;
          } 
          uniform sampler2D u_image;
          uniform vec4 u_bottomColor;
          uniform vec4 u_topColor;
          uniform float u_alpha;
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec4 colorImage = texture2D(u_image, materialInput.st);
            float lerp = colorImage.r * 0.299 + colorImage.g * 0.587 + colorImage.b * 0.144;
            material.diffuse = mix(u_bottomColor.rgb, u_topColor.rgb, lerp);
      
            // 红色边框线
            // vec2 p = (materialInput.st - 0.5) * vec2(1.0, 1.0);
            // float d1 = sdfBox(p , 0.5 * vec2(1.0, 1.0), 0.);
            // float d = smoothstep(0.0, 0.0015 * 2.0, abs(-d1));
            // material.diffuse = mix(material.diffuse, vec3(1.0, 0.0, 0.0), 1. - d);
            
            material.alpha = step(0.001, lerp);
            return material;
          }
          `
      }
    });
    dsmPrimitive = scene.primitives.add(new Cesium.GroundPrimitive({
      geometryInstances: [
        new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleGeometry({
            rectangle: tilingScheme.tileXYToRectangle(x, y, level),
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          }),
        })
      ],
      appearance: new Cesium.MaterialAppearance({
        material: dsmMaterial,
        closed: false
      })
    }));
    dsmPrimitive.show = params.markShow;
  })
} 

// addTile(428415, 228181, 19)






scene.postRender.addEventListener(() => {
  // console.log(scene.globe._surface._tilesToRender);
});





