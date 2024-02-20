
> 之前零零碎碎学过、用过cesium，但也没做记录，现在重新整理一下，方便学习回顾。

# 1.cesium简介

CesiumJS是一个开源JavaScript库，用于创建具有最佳性能、精度、视觉质量和易用性的世界级3D地球仪和地图。从航空航天到智能城市再到无人机，各行各业的开发人员都使用CesiumJS创建交互式Web应用程序来共享动态地理空间数据。
cesium官网链接
可以在官网下载cesium 的源码，也可以用npm下载依赖包

```js
npm install cesium
```

# 2.vue中使用cesium

# 3.天空盒子

# 4.地图加载

# 5.地形的加载

# 6.坐标系与转换

# 7.相机

# 8.添加物体

### 8.1 添加点

使用entities.add，添加一个点实体，并配置好点的位置、大小、颜色等信息。

```js
var point = viewer.entities.add({
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

### 8.2

# 9.entity实体

# 10.primitive图元

# 11

[传送门](https://juejin.cn/post/7259208528531324985?from=search-suggest)
