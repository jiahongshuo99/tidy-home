export function stage1Prompt(roomName) {
  return `你是一位专业的家居收纳顾问。这是用户家中「${roomName}」的照片。

请仔细分析照片中的收纳现状，返回以下 JSON 格式（只返回 JSON，不要包含任何其他文字或 markdown 代码块标记）：

{
  "zones": [
    {
      "id": "zone_1",
      "name": "区域名称（如：衣柜、书架、餐桌、床头柜等）",
      "type": "storage",
      "items": ["物品1", "物品2"],
      "issues": ["当前存在的收纳问题描述，没有问题则为空数组"]
    }
  ],
  "room_summary": "一句话描述这个房间的整体收纳状态"
}

zone 的 type 字段只能取以下值：
- storage：专门用于收纳的区域（柜子、抽屉、架子等）
- surface：水平台面（桌面、床头、茶几等）
- display：展示陈列区域（展示柜、墙面等）

尽可能识别照片中所有可见的区域，每个区域至少列出 2-3 个物品。`
}
