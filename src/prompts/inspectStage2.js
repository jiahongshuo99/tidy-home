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
      "current_zone": "当前所在区域（房间·区域，如：主卧·床头柜）",
      "reason": "为什么这个放置位置不合适（对照档案说明）",
      "suggestion": "建议移到哪里以及怎么整理"
    }
  ]
}

只列出真正有问题的物品，不要凑数。如果所有物品都符合档案标准，返回空数组：{ "misplaced_items": [] }

重要：所有字符串值内部禁止使用英文双引号 " 作为强调或引用标记（会破坏 JSON 格式）。如需强调词语，请使用「」代替。`
}
