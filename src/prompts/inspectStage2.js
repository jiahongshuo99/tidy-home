export function inspectStage2Prompt(profile, inspectSnapshots) {
  // profile: { rooms: [{ roomName, zones: [{ name, suitable_items }] }] }
  // inspectSnapshots: Array<{ roomName, analyses: [{ zones: [{ name, current_items }], room_summary }] }>
  const profileJson  = JSON.stringify(profile, null, 2)
  const snapshotJson = JSON.stringify(inspectSnapshots, null, 2)

  return `你是一位专业的家居收纳顾问。

【家居档案（各区域的标准收纳规范）】
${profileJson}

【本次巡检快照（各区域当前实际存放的物品）】
${snapshotJson}

请将巡检快照与家居档案进行对比，找出所有放置不合理的物品——即当前存放在某区域、但按照档案标准该区域并不适合存放该类物品的情况。

返回以下 JSON 格式（只返回 JSON，不要包含任何其他文字或 markdown 代码块标记）：

{
  "misplaced_items": [
    {
      "item": "物品名称",
      "room": "所在房间（与档案中的 roomName 保持一致，如：主卧）",
      "current_zone": "当前所在区域（房间·区域，如：主卧·床头柜）",
      "severity": "错放严重程度：minor（同房间内次优摆放）| moderate（跨区域明显错放）| major（安全/卫生/功能性严重违反）",
      "reason": "为什么这个放置位置不合适（对照档案说明）",
      "suggestion": "建议移到哪里以及怎么整理"
    }
  ]
}

severity 判断标准：
- minor：物品仍在合理范围内，只是没有放在最优位置（如遥控器放在沙发扶手而非茶几）
- moderate：物品明显放错了区域，影响整洁和使用效率（如鞋子放在客厅、书放在厨房）
- major：存在安全隐患、卫生问题或严重影响功能（如药物放在儿童可及处、清洁剂放在餐桌）

只列出真正有问题的物品，不要凑数。如果所有物品都符合档案标准，返回空数组：{ "misplaced_items": [] }

重要：所有字符串值内部禁止使用英文双引号 " 作为强调或引用标记（会破坏 JSON 格式）。如需强调词语，请使用「」代替。`
}
