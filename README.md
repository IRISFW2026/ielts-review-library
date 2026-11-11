# Iris 的雅思复习库

按时间、科目和主题查找复习内容。首页提供按时间、按主题与表格清单三种查看方式，并支持搜索和科目筛选。

[打开复习总览](https://irisfw2026.github.io/ielts-review-library/index.html)

## 命名规则

显示名称使用 `MMDD-科目-题型-English topic 中文主题`，例如 `1027-写作-大作文-Work-life balance 工作与生活平衡`。

日期优先依据材料文件名或材料标注；没有材料日期时，使用页面首次发布日期并在首页标注。技术更新日期不替代学习材料日期。目录包括年份，跨年不混淆。

## 目录结构

正式复习页放在 `reviews/YYYY-MM-DD/科目英文/题型英文/主题英文/index.html`。例如：

`reviews/2026-10-27/writing/task-2/work-life-balance/index.html`

`catalog.json` 是目录数据，记录日期依据、主题、路径和旧入口；首页使用同一份数据生成的内嵌快照，直接打开也能浏览。

根目录旧 HTML 文件保留为跳转入口。三篇阅读、四篇听力及五道小作文均按材料独立归档，原合集网址保留为篇目导航。可识别的旧篇目链接直接打开相应页面，并继续传递查询参数和章节锚点。

## 复习目录

| 日期 | 科目与题型 | 标准名称与链接 |
|---|---|---|
| 2026-11-11 | 阅读 真题 | [1111-阅读-真题-Global Warming in New Zealand 新西兰的全球变暖](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-11/reading/exam/global-warming-in-new-zealand/) |
| 2026-11-11 | 写作 小作文 | [1111-写作-小作文-Doctor in Australia 澳大利亚医生人数、性别与出生地](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-11/writing/task-1/doctor-in-australia/) |
| 2026-11-11 | 听力 Part 3 | [1111-听力-Part 3-Computer Labs 大学电脑机房](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-11/listening/part-3/computer-labs/) |
| 2026-11-10 | 听力 真题 | [1110-听力-真题-The Invasion of Plants 植物入侵](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-10/listening/exam/the-invasion-of-plants/) |
| 2026-11-09 | 阅读 真题 | [1109-阅读-真题-Unlocking the Mystery of Dreams 揭开梦境之谜](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-09/reading/exam/unlocking-the-mystery-of-dreams/) |
| 2026-11-09 | 阅读 真题 | [1109-阅读-真题-Can Hurricanes Be Moderated or Diverted? 飓风能否被减弱或改变方向？](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-09/reading/exam/can-hurricanes-be-moderated-or-diverted/) |
| 2026-11-06 | 阅读 真题 | [1106-阅读-真题-What the Managers Really Do? 管理者究竟做什么？](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-06/reading/exam/what-the-managers-really-do/) |
| 2026-11-06 | 听力 真题 | [1106-听力-真题-The Seahorses 海马](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-06/listening/exam/the-seahorses/) |
| 2026-11-06 | 听力 真题 | [1106-听力-真题-Organic farming 有机农业](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-06/listening/exam/organic-farming/) |
| 2026-11-06 | 阅读 真题 | [1106-阅读-真题-Honeybee in trouble 陷入困境的蜜蜂](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-06/reading/exam/honeybee-in-trouble/) |
| 2026-11-05 | 口语 模考 | [1105-口语-模考-Growing Vegetables & Sports 种植蔬菜与体育](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-05/speaking/mock/growing-vegetables-sports/) |
| 2026-11-03 | 阅读 真题 | [1103-阅读-真题-Class Size Effects 班级规模的影响](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-03/reading/exam/class-size-effects/) |
| 2026-11-02 | 写作 小作文 | [1102-写作-小作文-University Development 大学校园规划](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-02/writing/task-1/university-development/) |
| 2026-11-02 | 听力 真题 | [1102-听力-真题-Fitchton Railway Station 铁路车站](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-02/listening/exam/fitchton-railway-station/) |
| 2026-11-02 | 听力 真题 | [1102-听力-真题-Fashion Project On Jeans 牛仔裤时尚项目](https://irisfw2026.github.io/ielts-review-library/reviews/2026-11-02/listening/exam/fashion-project-on-jeans/) |
| 2026-10-29 | 口语 模考 | [1029-口语-模考-Emails & Buildings 邮件与建筑](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-29/speaking/mock/emails-buildings/) |
| 2026-10-27 | 写作 大作文 | [1027-写作-大作文-Work-life balance 工作与生活平衡](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-27/writing/task-2/work-life-balance/) |
| 2026-10-27 | 听力 Part 1 | [1027-听力-Part 1-AA Property Rentals 公寓租赁](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-27/listening/part-1/aa-property-rentals/) |
| 2026-10-26 | 阅读 真题 | [1026-阅读-真题-Why don’t we sleep 我们为什么不睡觉](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-26/reading/exam/why-dont-we-sleep/) |
| 2026-10-26 | 听力 Part 1 | [1026-听力-Part 1-Second-hand Cars 二手车咨询](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-26/listening/part-1/second-hand-cars/) |
| 2026-10-26 | 听力 Part 3 | [1026-听力-Part 3-Drama & Voice Coaching 戏剧声音指导](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-26/listening/part-3/drama-voice-coaching/) |
| 2026-10-24 | 写作 小作文 | [1024-写作-小作文-Young Population and Where They Live 混合图 · 年轻人口与居住分布](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-24/writing/task-1/young-population-and-residence/) |
| 2026-10-24 | 写作 小作文 | [1024-写作-小作文-University Student Commuting 饼图 · 大学生通勤](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-24/writing/task-1/university-student-commuting/) |
| 2026-10-24 | 写作 小作文 | [1024-写作-小作文-TV Centre Layout 地图 · 电视中心布局](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-24/writing/task-1/tv-centre-layout/) |
| 2026-10-24 | 写作 小作文 | [1024-写作-小作文-Plastic Bottle Recycling 流程图 · 塑料瓶回收](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-24/writing/task-1/plastic-bottle-recycling/) |
| 2026-10-24 | 写作 小作文 | [1024-写作-小作文-Course Ratings 表格 · 课程评价](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-24/writing/task-1/course-ratings/) |
| 2026-10-23 | 写作 小作文 | [1023-写作-小作文-Town Population 英国小镇人口](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-23/writing/task-1/town-population/) |
| 2026-10-23 | 口语 模考 | [口语模考，Speaking Studio](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-23/speaking/mock/speaking-studio/) |
| 2026-10-22 | 写作 小作文 | [1022-写作-小作文-Australia Employment 澳大利亚就业占比](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-22/writing/task-1/australia-employment/) |
| 2026-10-21 | 听力 Part 2 | [1021-听力-Part 2-Vacation Jobs 假期工作](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-21/listening/part-2/vacation-jobs/) |
| 2026-10-21 | 听力 Part 1 | [1021-听力-Part 1-Nature Farm 果园求职](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-21/listening/part-1/nature-farm/) |
| 2026-10-21 | 听力 Part 4 | [1021-听力-Part 4-Canadian Maple Syrup 加拿大枫糖浆](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-21/listening/part-4/canadian-maple-syrup/) |
| 2026-10-20 | 阅读 模考 | [1020-阅读-模考-The Kākāpō 鸮鹦鹉](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-20/reading/practice/kakapo/) |
| 2026-10-20 | 听力 Part 3 | [1020-听力-Part 3-How Babies and Children Learn 婴幼儿如何学习](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-20/listening/part-3/how-babies-and-children-learn/) |
| 2026-10-20 | 阅读 模考 | [1020-阅读-模考-The Davies Sisters 戴维斯姐妹](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-20/reading/practice/davies-sisters/) |
| 2026-10-19 | 阅读 模考 | [1019-阅读-模考-Robot Umpires 机器人裁判](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-19/reading/practice/robot-umpires/) |
| 2026-10-19 | 阅读 模考 | [1019-阅读-模考-Procrastination 拖延](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-19/reading/practice/procrastination/) |
| 2026-10-16 | 阅读 模考 | [1016-阅读-模考-Manatees 海牛](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-16/reading/practice/manatees/) |
| 2026-10-11 | 阅读 精读 | [1011-阅读-精读-Termite Mounds 白蚁丘](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-11/reading/close-reading/termite-mounds/) |
| 2026-10-06 | 口语 Part 1 | [1006-口语-Part 1-Singing 唱歌](https://irisfw2026.github.io/ielts-review-library/reviews/2026-10-06/speaking/part-1/singing/) |
| 2026-09-30 | 阅读 模考 | [0930-阅读-模考-Survivor’s Story 幸存者的故事](https://irisfw2026.github.io/ielts-review-library/reviews/2026-09-30/reading/practice/survivors-story/) |
| 2026-09-30 | 阅读 模考 | [0930-阅读-模考-Humans and Food 人类与食物](https://irisfw2026.github.io/ielts-review-library/reviews/2026-09-30/reading/practice/humans-and-food/) |
| 2026-09-30 | 阅读 模考 | [0930-阅读-模考-How they move 过山车如何运行](https://irisfw2026.github.io/ielts-review-library/reviews/2026-09-30/reading/practice/how-they-move/) |

## 更新约定

用户已确认本结构为所有后续复习链接的默认标准。每次新增或修订专题，都应同步更新目录与首页入口；具体步骤见 [AGENTS.md](AGENTS.md)。

更新 `catalog.json` 并确认专题页面已保存后，运行：

```bash
node scripts/build-catalog.mjs
node scripts/build-catalog.mjs --check
```

脚本自动同步标准名称、排序、首页数据、科目数量、最新入口及本文件目录。新增页面和目录更新应在同次发布中提交。

新增内容时，同步更新目录数据和首页快照；同一材料的修订保留现有专题地址。日期有新证据时，再更新归档并保留原地址跳转。更新后检查首页筛选、专题返回导航、旧书签和发布状态。

## 练习记录

专题迁移沿用原来的 localStorage 键与词句 ID，同一浏览器中的现有进度继续使用。记录不会自动跨设备同步，清理浏览器或更换设备前请从练习页导出备份。朗读依赖浏览器和设备提供的英语音色；部分页面另有在线词典发音选项。

整理日期为2026年10月27日。


## Speaking 2026 迁入

原 `IRISFW2026/speaking2026` 仓库中的两个独立页面已经归入本库：

- Speaking Studio：自定义Part 1至3题目、限时模考、整场原始录音、分题时间轴、Part 2提纲和ZIP导出。
- Singing：2026年10月6日的9道Part 1问答、纠错、关键词和跟读。

原网址保留为跳转入口。两库的GitHub Pages使用同一域名，模考工具继续沿用原localStorage键；页面不上传或迁入用户录音。录音仍需在刷新或关闭前导出。详见 [迁移记录](docs/speaking-migration.md)。




