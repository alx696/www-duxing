const DuXing = {
  init() {
    const map = new ol.Map({
      target: 'map',
      layers: [
        // new ol.layer.Tile({
        //   source: new ol.source.OSM()
        // })
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            attributions: '地图来自<a href="http://g.cn/">谷歌</a>',
            url: 'https://mt0.google.cn/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'
          })
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([104.84822, 38.38]),
        zoom: 2
      }),
      //设置组件
      controls: [
        new ol.control.Attribution()
      ],
      // //禁止交互(这种方式后期需要启用时比较麻烦, 需要创建交互组件)
      // interactions: ol.interaction.defaults({
      //   altShiftDragRotate: false,
      //   doubleClickZoom: false,
      //   keyboard: false,
      //   mouseWheelZoom: false,
      //   shiftDragZoom: false,
      //   dragPan: false,
      //   pinchRotate: false,
      //   pinchZoom: false
      // })
    });

    //禁止交互
    map.getInteractions().forEach(e => {
      e.setActive(false);
    });

    //添加适量图层
    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: []
      }),
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ff3300',
          width: 3
        }),
        image: new ol.style.Circle({
          color: '#ff3300',
          radius: 3,
          fill: new ol.style.Fill({
            color: 'orange'
          }),
          stroke: new ol.style.Stroke({ color: 'red', width: 1 })
        })
      })
    });
    map.addLayer(vectorLayer);

    // //画线
    // const pointArray = [
    //   ol.proj.fromLonLat([104.84822, 38.32034]),
    //   ol.proj.fromLonLat([102.84822, 36.32034])
    // ];
    // const lineString = new ol.geom.LineString(pointArray);
    // const lineStyle = [
    //   new ol.style.Style({
    //     stroke: new ol.style.Stroke({
    //       color: '#ff3300',
    //       width: 3
    //     })
    //   })
    // ];
    // const lineVector = new ol.layer.Vector({
    //   source: new ol.source.Vector({
    //     features: [
    //       new ol.Feature({
    //         name: 'Line',
    //         geometry: lineString
    //       })
    //     ]
    //   })
    // });
    // lineVector.setStyle(lineStyle);
    // map.addLayer(lineVector);

    //标记
    const pointArray = [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [94.59754, 32.73421]
        },
        "properties": {
          "name": "长江源头"
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [96.33911, 34.49503]
        },
        "properties": {
          "name": "黄河源头"
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [94.68017, 33.76521]
        },
        "properties": {
          "name": "澜沧江源头"
        }
      }
    ];
    let index = 0;
    let minX, minY, maxX, maxY;
    const showNext = () => {
      if (index >= pointArray.length) {
        if (pointArray.length > 0) {
          //缩放到地点边界
          const min = ol.proj.fromLonLat([minX, minY]);
          const max = ol.proj.fromLonLat([maxX, maxY]);
          const extent = [min[0], min[1], max[0], max[1]];
          map.getView().fit(extent, {
            size: map.getSize(),
            padding: [360, 60, 60, 60]
          });

          //允许交互
          map.getInteractions().forEach(e => {
            e.setActive(true);
          });
        }

        return;
      }

      const fp = pointArray[index];
      index++;

      //计算边界
      if (!minX) {
        minX = fp.geometry.coordinates[0];
        minY = fp.geometry.coordinates[1];
        maxX = fp.geometry.coordinates[0];
        maxY = fp.geometry.coordinates[1];
      } else {
        if (minX > fp.geometry.coordinates[0]) {
          minX = fp.geometry.coordinates[0];
        }
        if (minY > fp.geometry.coordinates[1]) {
          minY = fp.geometry.coordinates[1];
        }

        if (maxX < fp.geometry.coordinates[0]) {
          maxX = fp.geometry.coordinates[0];
        }
        if (maxY < fp.geometry.coordinates[1]) {
          maxY = fp.geometry.coordinates[1];
        }
      }

      const markerElement = document.createElement('div');
      markerElement.classList.add('marker');
      markerElement.innerHTML = fp.properties.name;
      const marker = new ol.Overlay({
        element: markerElement,
        position: ol.proj.fromLonLat(
          fp.geometry.coordinates
        ),
        positioning: 'bottom-center',
        stopEvent: false,
      });
      map.addOverlay(marker);

      vectorLayer.getSource().addFeature(
        new ol.Feature({
          geometry: new ol.geom.Point(
            ol.proj.fromLonLat(
              fp.geometry.coordinates
            )
          )
        })
      );

      map.getView().setZoom(12);
      //中心向下偏移一定距离
      map.getView().setCenter(
        ol.proj.fromLonLat([fp.geometry.coordinates[0], fp.geometry.coordinates[1] + 0.006])
      );
      map.getView().animate({
        zoom: 14,
        duration: 2000
      });

      window.setTimeout(showNext, 3000);
    };
    window.setTimeout(showNext, 3000);
  },

  initCesium() {
    const viewer = new Cesium.Viewer(
      'map',
      {
        homeButton: false,
        geocoder: false,
        baseLayerPicker: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        selectionIndicator: false,
        infoBox: false,
        // terrainProvider : Cesium.createWorldTerrain(),
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: 'https://mt0.google.cn/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
          credit: '谷歌'
        })
      }
    );

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        96.33911, 34.49503, 16000
      )
      // ,
      // orientation: {
      //   heading: Cesium.Math.toRadians(0),
      //   pitch: Cesium.Math.toRadians(-30),
      //   roll: 0
      // }
    });
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        96.33911, 34.49503
      ),
      label: {
        text: "黄河源头",
        font: "24px",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      },
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  DuXing.init();
});