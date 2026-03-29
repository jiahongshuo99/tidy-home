export function inspectStage1Prompt(roomName, knownZones) {
  // knownZones: Array<{ name, suitable_items }> from home profile
  const zonesJson = JSON.stringify(knownZones, null, 2)

  return `你是一位专业的家居收纳顾问。这是用户家中「${roomName}」的照片。

根据家居档案，该房间已知区域如下：
${zonesJson}

请仔细观察照片，盘点当前每个已知区域中实际存放的物品，同时识别照片中是否出现了档案中未记录的新区域。

返回以下 JSON 格式（只返回 JSON，不要包含任何其他文字或 markdown 代码块标记）：

{
  "zones": [
    {
      "name": "区域名称（与档案中的名称保持一致，如有新区域则使用照片中实际名称）",
      "current_items": ["当前实际存放的物品1", "当前实际存放的物品2"]
    }
  ],
  "room_summary": "一句话描述该房间当前的整理状态"
}

注意：
- 优先识别已知区域中的物品，保持区域名称与档案一致
- 如有新出现的区域也请记录
- current_items 只列出照片中实际可见的物品，不要推测

重要：所有字符串值内部禁止使用英文双引号 " 作为强调或引用标记（会破坏 JSON 格式）。如需强调词语，请使用「」代替。`
}
