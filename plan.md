# Tidy Home Demo — 产品与技术方案

## 产品概述

家庭收纳助手 app 的 demo。用户拍摄房间照片，由多模态模型提出收纳建议。

核心概念：
- **区域**：房间内的收纳区域（衣柜、书架、餐桌等）
- **物品**：区域内存放的物件

目标效果：识别各区域 → 判断适合存放的物品类型 → 发现错误放置 → 给出具体调整建议。

技术约束：demo 阶段纯前端，直接调用 Kimi API，无需后端。

---

## 核心技术方案：两阶段管线

多图分析面临上下文窗口限制，采用两阶段解决：

```
阶段1（并行）：每张照片单独调用模型 → 输出结构化 JSON（区域、物品、当前问题）
      ↓
阶段2（一次）：将所有 JSON 摘要（无图片）送入模型 → 输出跨房间的综合建议
```

- 图片只在阶段1出现，一次一张，不撑爆上下文
- 阶段1用 `Promise.allSettled()` 并行发请求，单张失败不影响其他
- 阶段1每完成一张立即更新卡片状态（非等全部完成后再渲染）
- 阶段2输入为纯文本 JSON 摘要，token 消耗少，保留跨房间信息

---

## 产品流程

```
1. 首页引导 → 用户输入 API Key（存 localStorage）
2. 上传照片（多张，支持拖拽）
3. 用户为每张照片选择房间类型（客厅/卧室/厨房/书房/卫生间/其他）
4. 点击「开始分析」→ 阶段1并行分析各照片
   - 每张卡片实时显示分析进度
   - 完成后展示识别到的区域列表和物品
5. 阶段2综合分析（自动触发，全部卡片完成后）
6. 结果页展示（三个 Tab）：
   - 区域规范：每个区域适合放什么物品类型
   - 问题清单：哪些物品的放置不合理
   - 行动建议：「把 X 从 Y 移到 Z」格式的具体步骤，按优先级排序
```

---

## 技术栈

- **框架**：React + Vite
- **样式**：Tailwind CSS
- **图标**：lucide-react
- **模型**：Kimi K2.5（OpenAI 兼容格式，支持视觉）
  - API Base: `https://api.moonshot.cn/v1`
  - Model: `kimi-k2.5`
  - 图片传入：base64 data URL，格式 `data:image/{ext};base64,{data}`
- **状态管理**：React useState + useContext
- **无后端**：API key 存 localStorage，前端直接请求

---

## 目录结构

```
tidy-home/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # 全局状态和页面流程控制
│   ├── api/
│   │   └── kimi.js             # API 调用封装（阶段1/阶段2）
│   ├── components/
│   │   ├── ApiKeySetup.jsx     # 首次使用输入 key
│   │   ├── PhotoUploader.jsx   # 拖拽上传 + 房间类型选择
│   │   ├── RoomCard.jsx        # 单张照片的分析卡片（含状态机）
│   │   ├── AnalysisResults.jsx # 综合建议展示（Tab 容器）
│   │   └── ActionItem.jsx      # 行动建议条目
│   └── prompts/
│       ├── stage1.js           # 阶段1 prompt 模板
│       └── stage2.js           # 阶段2 prompt 模板
```

---

## Prompt 设计

### 阶段1（每张照片）

```
你是一位专业的家居收纳顾问。这是用户家中「{room_type}」的照片。

请仔细分析照片，返回以下 JSON 格式（只返回 JSON，不要其他文字）：
{
  "zones": [
    {
      "id": "zone_1",
      "name": "区域名称（如：衣柜、书架、餐桌）",
      "type": "storage|surface|display",
      "items": ["物品1", "物品2"],
      "issues": ["当前存在的问题描述"]
    }
  ],
  "room_summary": "一句话描述这个房间的整体收纳状态"
}
```

### 阶段2（综合分析）

```
你是一位专业的家居收纳顾问。以下是用户家中各房间的现状分析数据：

{all_room_summaries_json}

基于「同类物品集中放置」「就近原则」「使用频率决定位置」等收纳原则，请返回以下 JSON（只返回 JSON，不要其他文字）：
{
  "zone_guidelines": [
    {"zone": "区域名", "suitable_items": ["适合放置的物品类型"]}
  ],
  "misplaced_items": [
    {"item": "物品名", "current_zone": "当前位置", "reason": "为什么不合适"}
  ],
  "actions": [
    {"priority": 1, "action": "把 X 从 Y 移到 Z", "reason": "原因"}
  ]
}
```

---

## UI 设计规范

### 设计理念

**高级清爽感**：大量留白、极简色彩、精准层级感。
参考风格：Linear、Raycast 的克制美学，融入家居场景的温暖质感。

核心原则：
- **呼吸感**：内容密度低，每个信息单元清晰可见
- **层次分明**：通过尺寸、字重、颜色区分优先级，不堆砌元素
- **克制用色**：99% 中性色，Accent 只在关键行动点出现
- **有机质感**：暖白背景、较大圆角，轻柔不冷硬

### 颜色系统

```
背景
  --bg-base:     #F7F5F2   暖白，主页面背景
  --bg-elevated: #FFFFFF   卡片背景

边框
  --border-subtle:  #EEEBE6   分割线
  --border-default: #DDD9D2   卡片、输入框
  --border-strong:  #C4BFB7   hover 状态

文字
  --text-primary:   #1C1917   正文、标题
  --text-secondary: #78716C   辅助说明
  --text-muted:     #A8A29E   占位符

主色 Accent（陶土橙）
  --accent:       #D97757
  --accent-hover: #C4623E
  --accent-light: #FDF0EB   tag/badge 背景
  --accent-text:  #9A3412   accent 区内深色文字

语义色
  --success:        #4D7C5F  / --success-light: #EFF7F2
  --warning:        #B45309  / --warning-light: #FEF3C7
  --error:          #B91C1C  / --error-light:   #FEF2F2
```

### 字体

```
字体栈：'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif

尺寸：
  12px  标签、时间戳
  13px  辅助说明
  15px  正文
  17px  卡片标题
  20px  区块标题
  26px  页面主标题
  32px  首屏大标题（行动建议编号）

字重：400 正文 / 500 强调 / 600 卡片标题、按钮 / 700 页面标题
```

### 间距与圆角

```
间距基于 4px 网格：4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px
页面内容最大宽：1024px，左右 padding 24px（移动端 16px）

圆角：
  6px   小 badge
  10px  按钮、小卡片
  14px  主要卡片
  20px  大模态框
  9999px pill tag
```

### 核心组件

**主按钮**：height 40px，padding 0 20px，背景 `--accent`，白色文字，font-weight 600，hover 时 `translateY(-1px)`

**卡片**：白底，1px `--border-default`，radius 14px，不用阴影。四种状态通过左侧 3px 竖线区分：
- `waiting`：无色竖线 + 骨架屏动画
- `loading`：`--accent` 竖线 + 模糊图片 + spinner
- `done`：`--success` 竖线
- `error`：`--error` 竖线 + 重试提示

**Tag**：pill 形，`--accent-light` 背景，`--accent-text` 文字，font-size 12px

### 页面设计

**页面1：API Key 配置**
- 垂直居中全屏，内容区宽 420px
- 家的线条图标（描边风格，`--accent` 色）+ 产品名
- 单个卡片：输入框（password 类型，支持显示/隐藏）+ 全宽主按钮

**页面2：照片上传**
- 顶部 56px Header（步骤指示器 + API Key 入口）
- 大标题 + 说明文案
- 拖拽上传区：dashed 边框，hover 变 `--accent` 色
- 4列照片网格，每张卡片下方有房间类型 select + 悬停显示删除按钮
- 右下角固定「开始分析（N张照片）→」按钮

**页面3：分析进行中**
- 顶部 4px 全宽进度条（`--accent` 色）
- 卡片状态机实时切换（见上方卡片规范）
- 所有卡片完成后底部出现 Banner：「✦ 正在综合分析所有房间…」（`--accent-light` 背景 + 脉冲点动画）

**页面4：结果页**
- 三个 Tab（下划线样式）：区域规范 / 问题清单 / 行动建议
- **区域规范**：双列卡片，每张展示区域名 + 适合物品 tag 列表
- **问题清单**：列表，左侧 3px `--warning` 竖线，`--warning-light` 背景（极淡）
- **行动建议**：编号 01/02/03 用 `--accent` 大字（32px）作视觉锚点，下方动作描述 + 原因

### 动效

- 微交互（hover/focus）：150ms ease
- 卡片展开：200ms ease-out
- 页面切换：250ms ease-in-out
- 骨架屏：shimmer（白色光条从左到右 CSS 动画）
- 脉冲点：scale 1→1.3→1，infinite，1.2s
- 不用弹跳、不用复杂延迟动画

### 图标

使用 `lucide-react`：Home / Upload / Image / Loader2 / CheckCircle2 / AlertTriangle / ArrowRight / Settings / X / ChevronDown

### Tailwind 扩展配置

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50:  '#FDF0EB',
        100: '#FAD9C8',
        500: '#D97757',
        600: '#C4623E',
        900: '#9A3412',
      }
    },
    fontFamily: {
      sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
    },
  }
}
```
