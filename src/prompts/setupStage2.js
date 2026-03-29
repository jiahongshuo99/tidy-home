export function setupStage2Prompt(groupedRooms) {
  // groupedRooms: Array<{ roomName: string, analyses: Array<{ zones, room_summary }> }>
  const summaryJson = JSON.stringify(groupedRooms, null, 2)

  return `你是一位专业的家居收纳顾问。以下是用户家中各房间的照片分析数据，同一房间可能包含多张照片的分析结果：

${summaryJson}

你的任务是为每个房间的每个区域制定收纳标准——明确该区域适合永久存放哪些类型的物品。
这份标准将作为「家居档案」保存，用于日后判断物品是否放置在正确位置。

请基于以下原则制定标准：
- 同类物品集中放置
- 就近原则（物品放在使用它的地方附近）
- 使用频率决定位置（高频物品放在顺手位置）
- 功能区域分离（避免不同功能的物品混放）

返回以下 JSON 格式（只返回 JSON，不要包含任何其他文字或 markdown 代码块标记）：

{
  "rooms": [
    {
      "roomName": "房间名称",
      "zones": [
        {
          "name": "区域名称",
          "suitable_items": ["适合长期存放的物品类型1", "适合长期存放的物品类型2"]
        }
      ]
    }
  ]
}

每个房间至少保留 2 个区域，每个区域至少列出 3 种适合存放的物品类型。
合并同一房间多张照片中相同名称的区域。

重要：所有字符串值内部禁止使用英文双引号 " 作为强调或引用标记（会破坏 JSON 格式）。如需强调词语，请使用「」代替。`
}
