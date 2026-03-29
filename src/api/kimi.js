import { stage1Prompt } from '../prompts/stage1.js'
import { stage2Prompt } from '../prompts/stage2.js'

const BASE_URL = 'https://api.moonshot.cn/v1'
const MODEL = 'kimi-k2.5'

function parseJSON(content) {
  // Strip markdown code fences if the model wraps output in them
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  return JSON.parse(cleaned)
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
