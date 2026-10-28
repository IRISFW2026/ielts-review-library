# UK QS150 · 2027 入学地图

个人页面：https://irisfw2026.github.io/ielts-review-library/uk-qs150-map/

2027 年入学、2026 年申请。保留原参考站的全屏地图、左侧浮层筛选、右侧院校详情与列表结构；底图沿用参考 Google Maps 的浅色主题，控件与标记采用更轻的圆形、半透明胶囊和柔和阴影。

## 排名与内容

当前采用最新 QS 世界大学排名 2027，已于 2026-06-18 发布。本次于 2026-10-28 核对 QS 官方院校档案，8 所大学排名与现有数值一致，因此保留数值并补充榜单年份和来源入口。

| 大学 | QS 2027 | QS 官方来源 |
| --- | --- | --- |
| 伯明翰大学 | =68 | https://www.topuniversities.com/universities/university-birmingham |
| 利兹大学 | =77 | https://www.topuniversities.com/universities/university-leeds |
| 格拉斯哥大学 | 80 | https://www.topuniversities.com/universities/university-glasgow |
| 谢菲尔德大学 | =82 | https://www.topuniversities.com/universities/university-sheffield |
| 南安普顿大学 | =111 | https://www.topuniversities.com/universities/university-southampton |
| 埃克塞特大学 | 136 | https://www.topuniversities.com/universities/university-exeter |
| 利物浦大学 | 139 | https://www.topuniversities.com/universities/university-liverpool |
| 纽卡斯尔大学 | 149 | https://www.topuniversities.com/universities/newcastle-university |

发布来源：https://www.qs.com/insights%2Fqs-world-university-rankings

课程推荐和预算数值沿用原站；预算明确标为估算，未声称是 2027 官方学费。本次没有重算预算或重新核验全部课程。

## 标记与 UI

- 五角星中心固定在院校坐标。未选择时为白色空心星、灰色描边；选中后变为暖黄色实心星，配轻微光晕。切换学校时取消上一所高亮。
- 圆形白色底托、半透明圆角校名标签和细引线；地图位置与标签偏移分开处理。
- 手机地图只显示校名，排名保留在列表和详情中；标签布局同时避让其他标签、星标、标题与操作控件。
- 列表图标改为圆形的院校线条图标，选中卡片使用淡黄色；去除蓝色大块背景和横向位移。
- 官网、申请入口、全屏、总览与缩放控件使用统一圆角和线条图标。减少动画设置会关闭装饰过渡。
- 保留原有信息层级，不改变成三栏布局。

## 地图交互

- 鼠标滚轮和触控板滚动缩放；支持双击放大、Shift 拖框缩放、主动拖动浏览与手机双指缩放。
- 使用四分之一级缩放步进，滚轮灵敏度调低；+ / − 按钮保留为辅助。
- “总览”按钮一键恢复全部分类及 8 校全景，保持当前学校选中状态（如有）。
- 点击地图星标、校名或院校卡片，放大定位并同步右上方详情；桌面为右侧面板预留空间。
- 筛选和窗口 / 全屏尺寸变化不自动重置视角；关闭惯性移动和长距离飞行动画。
- 手机选择卡片后将地图滚回可见位置。触屏手势已启用，尚未在真实手机上实机验证。

## 详情卡与申请入口

- 顶部直接提供学校官网及硕士申请入口，下方为地址、联系号码、Google Maps 查看 / 路线和申请规划。
- 详情与院校列表独立滚动，顶部名称和主要链接保持可见；切换院校后详情回顶。
- 官网页面引出的申请系统已核对；伯明翰、格拉斯哥和纽卡斯尔使用官方申请指引页，依该校流程进一步选课或点击 Apply now。
- 外链新窗口打开，电话可拨号，院校卡片支持 Enter / 空格选择。
- 未接入 Google Places API；照片、评分、评价和开放时间通过 Google Maps 链接查看，不在本站伪造。
- 联系信息与申请链接核对日期：2026-10-28。

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


## 实现

- `index.html`：原版 Leaflet 浮层结构、8 校数据、院校资料、交互和样式。
- `map-style.json`：浅蓝水域、浅灰陆地、柔和绿地、浅黄主干道；主要城市使用英文名称。
- Leaflet 1.9.4 管理交互与标记，OpenLayers 10.6.1 + ol-mapbox-style 13.8.0 以 Canvas 绘制矢量底图，无需 WebGL。
- Canvas 底图按 Leaflet 的位置、缩放和尺寸同步；数据来自 OpenFreeMap / OpenMapTiles / OpenStreetMap，署名显示在地图右下角。这不是 Google 或 Apple 官方地图。
- 依赖从固定版本 CDN 加载，需要网络；底图失败时仍保留院校列表与筛选。
- 旧的 app.js / styles.css / data.js 是早期未采用版本，当前 index 不引用。

## 本次验证

- JavaScript 语法检查通过；活动页面不再出现 2028。
- 浏览器实测滚轮放大 / 缩小、选择定位、唯一黄色高亮，以及总览恢复全部分类和 8 校范围。
- 手机 390px 预览：标签不超界、不互相遮挡、不遮住其他星标，标题与总览 / 全屏按钮无重叠。
- 最新 QS 2027 年份、来源入口与申请链接在详情中显示。
- 真实手机双指手势未实机测试，其他仓库页面不受影响。
