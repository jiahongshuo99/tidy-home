import { stage1Prompt } from '../prompts/stage1.js'
import { stage2Prompt } from '../prompts/stage2.js'

const BASE_URL = 'https://api.moonshot.cn/v1'
const MODEL = 'kimi-k2.5'

// Replace unescaped " used as emphasis marks inside JSON string values.
// Walks the JSON char-by-char: when inside a string, a " that is NOT followed
// by a structural JSON character (,  }  ]  :  newline) is treated as an
// embedded emphasis quote and replaced with 「 (open) or 」 (close).
function repairEmbeddedQuotes(str) {
  let result = ''
  let inString = false
  let inEmbedded = false
  let i = 0
  while (i < str.length) {
    const ch = str[i]
    if (ch === '\\' && inString) {
      result += ch + (str[i + 1] ?? '')
      i += 2
      continue
    }
    if (ch === '"') {
      if (!inString) {
        inString = true
        result += ch
      } else if (inEmbedded) {
        inEmbedded = false
        result += '」'
      } else {
        // Peek at next non-space char to decide: structural close vs embedded open
        let j = i + 1
        while (j < str.length && (str[j] === ' ' || str[j] === '\t')) j++
        const peek = str[j]
        const isClose = peek === undefined || [',', '}', ']', '\n', '\r', ':'].includes(peek)
        if (isClose) {
          inString = false
          result += ch
        } else {
          inEmbedded = true
          result += '「'
        }
      }
    } else {
      result += ch
    }
    i++
  }
  return result
}

function parseJSON(content) {
  // Strip markdown code fences
  const stripped = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  try {
    return JSON.parse(stripped)
  } catch {
    // Repair embedded unescaped quotes and retry
    return JSON.parse(repairEmbeddedQuotes(stripped))
  }
}

async function callKimi(apiKey, messages, maxTokens = 1500, thinking = true) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages,
      thinking: { type: thinking ? 'enabled' : 'disabled' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `请求失败（HTTP ${response.status}）`)
  }

  const data = await response.json()
  const msg = data.choices[0].message
  // kimi-k2.5 is a reasoning model — content may be empty if all tokens were
  // consumed by reasoning_content; fall back to extracting JSON from it
  if (msg.content && msg.content.trim()) {
    return msg.content
  }
  if (msg.reasoning_content) {
    // extract the last JSON block from the reasoning trace
    const match = msg.reasoning_content.match(/```json\s*([\s\S]*?)```(?![\s\S]*```json)/i)
      || msg.reasoning_content.match(/(\{[\s\S]*\})\s*$/)
    if (match) return match[1]
  }
  throw new Error('模型未返回有效内容，请重试')
}

export async function analyzePhoto(apiKey, imageDataUrl, roomName, thinking = true) {
  const content = await callKimi(apiKey, [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: imageDataUrl },
        },
        {
          type: 'text',
          text: stage1Prompt(roomName),
        },
      ],
    },
  ], 4000, thinking)

  return parseJSON(content)
}

export async function synthesizeResults(apiKey, roomResults, thinking = true) {
  const content = await callKimi(apiKey, [
    {
      role: 'user',
      content: stage2Prompt(roomResults),
    },
  ], 8000, thinking)

  return parseJSON(content)
}
