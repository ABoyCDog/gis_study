
> 之前零零碎碎学过、用过cesium，但也没做记录，现在重新整理一下，方便学习回顾。

# 1.cesium简介

CesiumJS是一个开源JavaScript库，用于创建具有最佳性能、精度、视觉质量和易用性的世界级3D地球仪和地图。从航空航天到智能城市再到无人机，各行各业的开发人员都使用CesiumJS创建交互式Web应用程序来共享动态地理空间数据。
cesium官网链接
可以在官网下载cesium 的源码，也可以用npm下载依赖包

```js
npm install cesium
```

# 2.vue中使用cesium

### 2.1初始化地球

创建vue项目，用包管理工具下载好cesium，在node_modules中找到下面的4个资源，复制粘贴到public文件夹下，当然，Widgets文件夹里最好都是css资源，可以放在src里面，方面后续调用。
![image](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/613854886695470cb7c79982e0482160~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

准备一个div，给定id，用来承接cesium的展示

```js
<div id="cesiumContainer" ref="cesiumContainer"></div>
```

然后引入cesium和相关的css资源

```js
import * as Cesium from "cesium";
import "./Widgets/widgets.css";
```

```js
<template>
  <div id="cesiumContainer" ref="cesiumContainer"></div>
</template>

<script setup>
import * as Cesium from "cesium";
import "./Widgets/widgets.css";
import { onMounted } from "vue";

// 设置cesium token
Cesium.Ion.defaultAccessToken =
  "这个token需要自己去申请，百度即可找到方法";

window.CESIUM_BASE_URL = "/";

// 设置cesium默认视角
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  // 西边的经度
  89.5,
  // 南边维度
  20.4,
  // 东边经度
  110.4,
  // 北边维度
  61.2
);

onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
  });

  // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";
});
```

展示地球
![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1103c8f8c5f64ab592b653ba041a0b74~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)
ceisum提供了一些默认的交互方式，例如：

·按住鼠标左键拖曳:拖动相机在三维地球平面平移。

·按住鼠标右键拖曳:缩放相机。

·使用鼠标滚轮（即鼠标中键）滑动:缩放相机。

·按住鼠标滚轮拖曳:根据当前地球的屏幕中点,旋转相机。

### 2.2基础配置

cesium有一些默认的控件，我们可以去设置控件的显示隐藏。
![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e840770221dc41909d6dfee35e2ed4c7~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)
![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7a4fa121c9f4c178412158248bc12d3~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
    // 是否显示信息窗口
    infoBox: false,
    // 是否显示查询按钮
    geocoder: false,
    // 不显示home按钮
    homeButton: false,
    // 控制查看器的显示模式
    sceneModePicker: false,
    // 是否显示图层选择
    baseLayerPicker: false,
    // 是否显示帮助按钮
    navigationHelpButton: false,
    // 是否播放动画
    animation: false,
    // 是否显示时间轴
    timeline: false,
    // 是否显示全屏按钮
    fullscreenButton: false,
  });
```

# 3.天空盒子

cesium中有天空盒的概念，其实就是在一个立方体盒子的六个面上贴图，当然这些贴图是同一个场景下的，然后将【相机】，也就是观察视角，放在盒子的中心位置，这样无论朝哪个方向去看，都能收获三维立体的沉浸感。
![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd4bf2257384441d97e4aefe85ae5803~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)
如何操作天空盒？主要是用到SkyBox类

实现方法：

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
    skyBox: new Cesium.SkyBox({
      sources: {
        positiveX: "./texture/sky/px.jpg",
        negativeX: "./texture/sky/nx.jpg",
        positiveY: "./texture/sky/ny.jpg",
        negativeY: "./texture/sky/py.jpg",
        positiveZ: "./texture/sky/pz.jpg",
        negativeZ: "./texture/sky/nz.jpg",
      },
    }),
  });
```

![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a5fe63d625c43ec9e19a133f584e94a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

# 4.地图加载

cesium提供了非常强大且全面的API用来加载数据、地图，这个可以专门写一篇文章详细说明，这里只罗列一些常见地图的加载。可以使用imageryProvider来加载地图。

### 4.1 天地图

加载天地图影像：

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=申请的K值",
        layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
     }),
  });
```

还可以继续加载地图（或地图注记），实现地图的叠加展示，使用viewer.imageryLayers.addImageryProvider。

```js
//地图叠加：下面这个图层是 放在上层的图层
  const imageryLayers = viewer.imageryLayers;
  const layer = imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      layer: "tdtVecBasicLayer",
      style: "default",
      format: "image/png",
      tileMatrixSetID: "GoogleMapsCompatible",
    })
  );
```

后加入的地图默认会覆盖前面的地图。

### 4.2 高德地图

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      layer: "tdtVecBasicLayer",
      style: "default",
      format: "image/png",
      tileMatrixSetID: "GoogleMapsCompatible",
    }),
  });
```

### 4.3 OSM

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
 // OSM地图,
     imageryProvider: new Cesium.OpenStreetMapImageryProvider({
       url: "https://a.tile.openstreetmap.org/",
    }),
});
```

这里用的是Cesium.OpenStreetMapImageryProvider.

当然，还有非常多地图需要加载.

# 5.地形的加载

### 5.1 加载在线地形

这里使用到了Cesium自带的方法，在线加载地形

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
  // 设置地形
  terrainProvider： Cesium.createWorldTerrain();
})
```

![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/74a5ba30bc864d6287a3f92a4f0398ec~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

### 5.2 本地加载地形

提前准备好地形数据，这里使用 广州某地区的地形切片

```js
const viewer = new Cesium.Viewer("cesiumContainer", {

//加载自己准备的数据
    terrainProvider: Cesium.createWorldTerrain({
        url: "./terrains/gz",
    }),
});
```

# 6.坐标系与转换

cesium中常见的坐标系：

+ WGS-84地理坐标系
+ 屏幕坐标系（笛卡尔平面坐标系）
+ 笛卡尔空间直角坐标系

### 6.1 WGS-84地理坐标系

通过new Cesium.Cartographic(longitude, latitude, height)来创建，三个参数分别为经度纬度高度。
![image](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ebd3acc64544b45a32b9663d9584139~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

### 6.2 屏幕坐标系（笛卡尔平面直角坐标系）

屏幕坐标系即二维笛卡尔坐标系，Cesium中使用Cartesian2来描述，屏幕左上角为原点(0，0)，单位为像素，屏幕水平方向为x轴，向右为正；垂直方向为Y轴，向下为正。通过new Cesium.Cartesian2(x, y)创建对象，其中的(x, y)代表平面坐标系的坐标。
![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11538c75f4a24999a2f0d3503d45ab07~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

### 6.3 笛卡尔空间直角坐标系(世界坐标系)

世界坐标系Cartesian3，笛卡尔空间直角坐标系的原点就是椭球体的中心点。由于我们在计算机上绘制图时不方便参照经纬度直接绘制，所以通常就会先将坐标系转换为笛卡尔坐标系，再进行绘制。

在Cesium中使用Cartesian3类，通过new Cesium.Cartesian3(x,y,z)创建对象，其中的(x,y,z)代表笛卡尔空间直角坐标系中的坐标。
![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7a1008f695c4ba9a8b28bd61b9fe88d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

### 6.4 坐标转换

1. 角度与弧度转换
WGS84坐标的经纬度有弧度、角度两种形式，可以使用cesium提供的数学方法进行转换，弧度转角度，角度转弧度。

```js
// 角度转弧度
const radians = Cesium.Math.toRadians(90);
// 弧度转角度
const degrees = Cesium.Math.toDegrees(2*Math.PI);
```

当然也有经纬度转弧度,可以使用Cesium.Cartographic.fromDegrees

```js
// WGS84经纬度坐标 转 弧度坐标
const radians = Cesium.Cartographic.fromDegrees(longitude, latitude, height)
```

2. 屏幕坐标转世界坐标(Cartesian2->Cartesian3)
创建变量handler，并实例化一个ScreenSpaceEventHandler对象，然后使用该对象的setInputAction方法设置要在输入事件上执行的功能。

```js
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function(movement) {
  // 屏幕坐标
  console.log(movement.position);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
```

关于世界坐标，三种情况，点的地形、模型、倾斜摄影。

  >+ 场景坐标，包括地形、倾斜摄影模型等的坐标
  >
```js
  //屏幕坐标 转 世界坐标（场景坐标，包括地形、倾斜摄影模型等的坐标）
  const cartesian3 = viewer.scene.pickPosition(movement.position);
  //注意此处的屏幕坐标一定要在球上，否则结果为undefined
  console.log("屏幕坐标转世界坐标（场景）：", cartesian3);
```
  >
  >+ 地表坐标，包括地形但不包括模型、倾斜摄影
  >
```js
const ray = viewer.camera.getPickRay(movement.position);
const cartesian3 = viewer.scene.globe.pick(ray, viewer.scene);
```
  >
  >+ 椭球面坐标，不包括地形、模型、倾斜摄影
  >
```js
const cartesian3 = viewer.scene.camera.pickEllipsoid(movement.position);
```

3. 世界坐标转屏幕坐标
通过Cesium.SceneTransforms.wgs84ToWindowCoordinates方法将世界坐标系转为平面坐标系。该方法传入两个参数，scene和position.

```js
const cartesian2 = Cesium.SceneTransforms.wgs84ToCoordinates(viewer.scene, cartesian3)
```

4. 世界坐标转WGS84

```js
const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
```

5. WGS坐标转世界坐标

```js
// WGS84经纬度转世界坐标
const cartesian3 = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
// WGS84弧度转世界坐标
const cartesian3 = Cesium.Cartesian3.fromRadians(cartographic.longtitude, cartographic.latitude, cartographic.height)
```

# 7.相机

cesium通过相机来控制视域，当我们进行交互，实现地图的放大缩小、视角的转换
等等操作时，实际上是相机在转换、移动。
ceisum提供了一些默认的交互方式，例如：

+ ·按住鼠标左键拖曳:拖动相机在三维地球平面平移。
+ ·按住鼠标右键拖曳:缩放相机。
+ ·使用鼠标滚轮（即鼠标中键）滑动:缩放相机。
+ ·按住鼠标滚轮拖曳:根据当前地球的屏幕中点,旋转相机。

### 7.1 相机参数

如何设置参数？主要是借助于viewer.camera.setView

```js
const position = Cesium.Cartesian3.fromDegrees(116.393428, 39.90923, 100);
  viewer.camera.setView({
    // 指定相机位置
    destination: position,
    // 指定相机视角
    orientation: {
      // 指定相机的朝向,偏航角
      heading: Cesium.Math.toRadians(0),
      // 指定相机的俯仰角,0度是竖直向上,-90度是向下
      pitch: Cesium.Math.toRadians(-20),
      // 指定相机的滚转角,翻滚角
      roll: 0,
    },
  });
```

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4dc17c4677874d8d9d975e0b8fd64d6b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)
pitch、heading、row三个参数表示相机的姿态，使用position表示相机位置。
heading：默认方向为正北，正角度为向东旋转，即水平旋转，也叫偏航角。
pitch：默认角度为-90，即朝向地面，正角度在平面之上，负角度为平面下，即上下旋转，也叫俯仰角。
roll：默认旋转角度为0，左右旋转，正角度向右，负角度向左，也叫翻滚角。

### 7.2 相机动画

可以让画面飞向指定的位置,并设置好相应的视角

```js
  // flyto,让相机飞往某个地方
  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-20),
      roll: 0,
    },
  });
```

### 7.3 键盘操控相机

给键盘绑定一个监听函数，控制相机的移动、旋转。这里主要用到的就是相机身上自带的一系列方法。

```js
// 通过按键移动相机
document.addEventListener('keydown', e => {
  // console.log(e);
  // 获取相机的离地高度
  const height = viewer.camera.positionCartographic.height;
  const moveRate = height / 100;
  switch (e.key) {
    case 'w':
      // 设置相机向前移动
      viewer.camera.moveForward(moveRate);
      break;
    case 's':
      viewer.camera.moveBackward(moveRate);
      break;
    case 'a':
      // 设置相机向左移动
   viewer.camera.moveLeft(moveRate);
      break;
    case 'd':
      // 设置相机向右移动
   viewer.camera.moveRight(moveRate);
      break;
    case 'q':
      // 设置相机向左旋转相机
   viewer.camera.lookLeft(Cesium.Math.toRadians(0.1));
      break;
    case 'e':
      // 设置相机向右旋转相机
   viewer.camera.lookRight(Cesium.Math.toRadians(0.1));
      break;
    case 'r':
      // 设置相机向上旋转相机
   viewer.camera.lookUp(Cesium.Math.toRadians(0.1));
      break;
    case 'f':
      // 设置相机向下旋转相机
   viewer.camera.lookDown(Cesium.Math.toRadians(0.1));
      break;
    case 'g':
      // 向左逆时针翻滚
   viewer.camera.twistLeft(Cesium.Math.toRadians(0.1));
      break;
    case 'h':
      // 向右顺时针翻滚
      viewer.camera.twistRight(Cesium.Math.toRadians(0.1));
      break;
  }
})
```

# 8.添加物体

### 8.1 添加点

使用entities.add，添加一个点实体，并配置好点的位置、大小、颜色等信息。

```js
const point = viewer.entities.add({
    // 定位点
    position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 700),
    // 点
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 4,
    },
  });
```

### 8.2 添加一个文字标签

还是使用entities的add方法，来添加物体，其中label代表文字部分，在配置项中设置好相关属性；billboard是广告牌的意思，可以显示图片图标。

```js
// 添加文字标签和广告牌
  const label = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 750),
    label: {
      text: "广州塔",
      font: "24px sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 4,
      // FILL填充文字，OUTLINE勾勒标签，FILL_AND_OUTLINE填充文字和勾勒标签
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      // 设置文字的偏移量
      pixelOffset: new Cesium.Cartesian2(0, -24),
      // 设置文字的显示位置,LEFT /RIGHT /CENTER
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      // 设置文字的显示位置
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    },
    billboard: {
      image: "./texture/gzt.png",
      width: 50,
      height: 50,
      // 设置广告牌的显示位置
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      // 设置广告牌的显示位置
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    },
  });
```

效果如下：

![Alt text](image.png)

## 8.3 添加飞机模型

```js
// 添加3D模型
const airplane = viewer.entities.add({
    name: "Airplane",
    position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1500),
    model: {
            uri: "./model/Air.glb",
            // 设置飞机的最小像素
            minimumPixelSize: 128,
            // 设置飞机的轮廓
            silhouetteSize: 5,
            // 设置轮廓的颜色
            silhouetteColor: Cesium.Color.WHITE,
            // 设置相机距离模型多远的距离显示
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    0,
                    200000
            ),
    },
});
```

![Alt text](image-1.png)

## 8.4 添加一个矩形

传入2个点位参数，就能添加矩形

```js
  // 使用entity创建矩形
  const rectangle = viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(
        // 西边的经度
        90,
        // 南边维度
        20,
        // 东边经度
        110,
        // 北边维度
        30
      ),
      material: Cesium.Color.RED.withAlpha(0.5),
    },
  });
```

# 9.entity实体

# 10.primitive图元

# 11

[传送门](https://juejin.cn/post/7259208528531324985?from=search-suggest)
