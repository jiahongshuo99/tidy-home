// Penalty per severity level (deducted from 100)
const PENALTIES = { minor: 5, moderate: 12, major: 25 }

// Grade thresholds (highest first)
const GRADES = [
  { min: 90, label: '优秀',  card: 'bg-[#F0F7F3] border-[#C8E0D0]', text: 'text-[#2D6A4F]', circle: 'bg-[#C8E0D0]' },
  { min: 75, label: '良好',  card: 'bg-[#FDF0EB] border-[#FAD9C8]', text: 'text-[#C4623E]', circle: 'bg-[#FAD9C8]' },
  { min: 60, label: '一般',  card: 'bg-amber-50 border-amber-200',   text: 'text-amber-700', circle: 'bg-amber-100' },
  { min: 40, label: '较差',  card: 'bg-orange-50 border-orange-200', text: 'text-orange-700',circle: 'bg-orange-100' },
  { min: 0,  label: '需整理',card: 'bg-red-50 border-red-200',       text: 'text-red-700',   circle: 'bg-red-100' },
]

export function getGradeConfig(overall) {
  return GRADES.find(g => overall >= g.min) ?? GRADES[GRADES.length - 1]
}

/**
 * Calculate inspection score from Stage 2 output.
 *
 * @param {Array} misplacedItems - result.misplaced_items from Stage 2
 * @returns {{
 *   overall: number,          // 0–100
 *   grade: string,            // 优秀 / 良好 / 一般 / 较差 / 需整理
 *   breakdown: { minorCount, moderateCount, majorCount },
 *   rooms: Array<{ roomName, score, misplacedCount }>
 * }}
 */
export function calculateScore(misplacedItems = []) {
  const penalty = misplacedItems.reduce(
    (sum, item) => sum + (PENALTIES[item.severity] ?? PENALTIES.moderate),
    0
  )
  const overall = Math.max(0, 100 - penalty)
  const grade   = getGradeConfig(overall).label

  // Per-room breakdown
  const roomMap = {}
  misplacedItems.forEach(item => {
    // Use explicit `room` field; fall back to parsing "房间·区域" format
    const roomName = item.room || item.current_zone?.split('·')[0] || '未知房间'
    if (!roomMap[roomName]) roomMap[roomName] = []
    roomMap[roomName].push(item)
  })

  const rooms = Object.entries(roomMap).map(([roomName, items]) => ({
    roomName,
    score: Math.max(0, 100 - items.reduce(
      (s, i) => s + (PENALTIES[i.severity] ?? PENALTIES.moderate), 0
    )),
    misplacedCount: items.length,
  }))

  return {
    overall,
    grade,
    breakdown: {
      minorCount:    misplacedItems.filter(i => i.severity === 'minor').length,
      moderateCount: misplacedItems.filter(i => i.severity === 'moderate').length,
      majorCount:    misplacedItems.filter(i => i.severity === 'major').length,
    },
    rooms,
  }
}
