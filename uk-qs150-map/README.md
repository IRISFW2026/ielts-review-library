# UK QS150 · 浅色底图、固定星标与稳定视角

个人账号页面：https://irisfw2026.github.io/ielts-review-library/uk-qs150-map/

按照用户要求，沿用原链接 https://vexonglobalmx-cloud.github.io/uk-qs150-map/ 的浮层布局、白色标签、蓝色选中态和院校联动。底图使用参考 Google Maps 视觉风格的浅色主题；根据后续反馈，院校位置改用固定五角星，点击院校时明确放大定位，其余操作保持稳定视角。

## 地图样式

- 浅蓝水域、浅灰陆地、柔和绿地。
- 降低全景信息密度；主要城市使用英文名称。
- 主要公路为浅黄色，普通道路为白色，放大后显示更多道路与建筑。
- 海上航线与地形阴影不在此主题中显示。
- 五角星中心锚定院校坐标；星标为金色，选中时变蓝且不改变尺寸。校名独立偏移，以细线连接；手机端标签自动避让、保持在地图内。

## 实现与数据

- `index.html`：原版 Leaflet UI、院校数据和点击 / 筛选 / 全屏交互。
- `map-style.json`：自定义地图配色、图层、标签与缩放规则。
- 底图数据：OpenFreeMap / OpenMapTiles / OpenStreetMap。此页面并非 Google 官方地图，也未调用 Google Maps API。
- 使用 OpenLayers 10.6.1 与 ol-mapbox-style 13.8.0 的 Canvas 渲染，无需 WebGL。底图视角随 Leaflet 移动、缩放和尺寸变化同步。
- 依赖从固定版本 CDN 加载；矢量地图从 OpenFreeMap 公共服务加载，需要网络连接。底图初始化失败时仍保留院校列表和筛选。
- 可见署名保留在地图右下角。

官方参考：https://openlayers.org/ol-mapbox-style/ · https://openfreemap.org/quick_start/ · https://openmaptiles.org/docs/terminology/attribution/

数据、2028 规划标题、专业及费用记录均沿用原网站；此次只更新地图展示，没有重新核验这些信息。

## 视角控制

- 点击地图星标、校名或院校列表，选中该校并放大至城市范围（缩放级别 9）；星标及校名变蓝，切换院校时取消上一所的高亮。手机端选择后将地图滚回可见位置。
- 切换分类只筛选院校，不重置地图。
- 关闭滚轮、双击、惯性移动和缩放动画；默认只允许使用 + / − 按钮缩放。
- 桌面支持主动拖动；移动设备关闭单指拖图，避免和页面滚动冲突。
- 详情中的“定位这所学校”可再次定位；点击选择和再次定位均为桌面右侧面板预留空间。
- “返回英国院校全景”明确恢复全部 8 所院校范围。
- 窗口尺寸与全屏变化保持中心和缩放，不再 fitBounds 重置；地图拖动范围限制在英国及周边。
- 保留现有标记实例，选择时仅切换高亮；Canvas 底图同步渲染，降低底图和标记错位感。

## 验证

已在浏览器验证：点击星标或院校列表会放大定位，只有所选学校的星标变蓝，详情同步更新。此前已验证分类筛选保留视角、滚轮不改变视角、手动缩放 / 定位 / 返回全景正常，手机标签不互相遮挡、不超出地图；窗口尺寸变化保持视角。未在真实触屏设备上实机测试。仓库中其他页面不受影响。

## 院校详情卡（2026-10-28）

- 选中大学后，右上方显示该校中英文名称、城市 / 地区、校区或联系地址、学校总机 / 招生咨询电话；点击电话可拨号。
- 详情首屏提供学校官网与硕士申请入口两个按钮，滚动详情时保持在顶部。
- 申请链接来自各校官方申请流程：利兹、谢菲尔德、南安普顿、埃克塞特、利物浦链接至官方页面引出的申请系统；伯明翰、格拉斯哥、纽卡斯尔链接至官方申请页面，并提示进一步选择课程或点击 Apply now。
- 新窗口打开外链，不影响当前选校；每所学校的官方联系信息和申请说明可从详情底部追溯。
- Google Maps 查看 / 路线按钮以当前院校名称和地址生成链接。页面未接入 Google Places API，未存储或伪造 Google 评分、评论、营业时间与照片；这些信息可在 Google Maps 中查看。
- 右侧详情与院校列表独立滚动。点击其他院校会放大定位、切换唯一蓝色星标、同步详情并回到详情顶部；手机端使用相同详情内容。
- 院校卡片支持 Enter / 空格选择。

### 联系信息与申请来源

| 大学 | 联系 / 地址来源 | 官方硕士申请流程 |
| --- | --- | --- |
| 伯明翰 | https://www.birmingham.ac.uk/contact | https://www.birmingham.ac.uk/study/postgraduate/taught/apply |
| 利兹 | https://www.leeds.ac.uk/contactus | https://www.leeds.ac.uk/study/doc/apply-masters-courses |
| 格拉斯哥 | https://www.gla.ac.uk/explore/maps/contact/ （地址另见 https://www.gla.ac.uk/myglasgow/planning/contact/） | https://www.gla.ac.uk/postgraduate/how-to-apply-for-a-postgraduate-taught-degree/applying-for-a-programme/ |
| 谢菲尔德 | https://sheffield.ac.uk/efm/contact | https://sheffield.ac.uk/postgraduate/taught/apply/applying |
| 南安普顿 | https://www.southampton.ac.uk/about/contact | https://www.southampton.ac.uk/study/postgraduate-taught/apply |
| 埃克塞特 | https://www.exeter.ac.uk/contact/ | https://www.exeter.ac.uk/masters-degrees/apply/ |
| 利物浦 | https://www.liverpool.ac.uk/about/contact-us/ | https://www.liverpool.ac.uk/postgraduate-taught/applying/online/ |
| 纽卡斯尔 | https://www.ncl.ac.uk/who-we-are/contact/ | https://www.ncl.ac.uk/postgraduate/applications-offers/ |

本次浏览器验证覆盖 8 校依次切换、唯一星标高亮、详情回顶、两条主要链接与院校对应、桌面详情 / 列表可独立滚动，以及 390px 手机布局无横向溢出。外部申请系统由学校运营，部分需要 JavaScript 或登录；本次只核对公开入口，未登录或提交申请。
