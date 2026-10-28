# UK QS150 · 原版 UI 与清爽浅色底图

个人账号页面：https://irisfw2026.github.io/ielts-review-library/uk-qs150-map/

按照用户要求，沿用原链接 https://vexonglobalmx-cloud.github.io/uk-qs150-map/ 的浮层布局、白色标签、蓝色选中态和院校联动。仅把底图改为参考 Google Maps 视觉风格的浅色主题。

## 地图样式

- 浅蓝水域、浅灰陆地、柔和绿地。
- 降低全景信息密度；主要城市使用英文名称。
- 主要公路为浅黄色，普通道路为白色，放大后显示更多道路与建筑。
- 海上航线与地形阴影不在此主题中显示。
- 学校标签居中锚定坐标，修复原版重复偏移造成的定位误差。

## 实现与数据

- `index.html`：原版 Leaflet UI、院校数据和点击 / 筛选 / 全屏交互。
- `map-style.json`：自定义地图配色、图层、标签与缩放规则。
- 底图数据：OpenFreeMap / OpenMapTiles / OpenStreetMap。此页面并非 Google 官方地图，也未调用 Google Maps API。
- 使用 OpenLayers 10.6.1 与 ol-mapbox-style 13.8.0 的 Canvas 渲染，无需 WebGL。底图视角随 Leaflet 移动、缩放和尺寸变化同步。
- 依赖从固定版本 CDN 加载；矢量地图从 OpenFreeMap 公共服务加载，需要网络连接。底图初始化失败时仍保留院校列表和筛选。
- 可见署名保留在地图右下角。

官方参考：https://openlayers.org/ol-mapbox-style/ · https://openfreemap.org/quick_start/ · https://openmaptiles.org/docs/terminology/attribution/

数据、2028 规划标题、专业及费用记录均沿用原网站；此次只更新地图展示，没有重新核验这些信息。

已验证桌面全景与院校放大视图、筛选与详情联动、标记定位，以及 390px 宽度手机预览。仓库中其他页面不受影响。
