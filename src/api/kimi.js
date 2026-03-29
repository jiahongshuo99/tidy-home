import { stage1Prompt } from '../prompts/stage1.js'
import { stage2Prompt } from '../prompts/stage2.js'

const BASE_URL = 'https://api.moonshot.cn/v1'
const MODEL = 'kimi-k2.5'

function parseJSON(content) {
  // Strip markdown code fences if the model wraps output in them
  const cleaned = content
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
  return JSON.parse(cleaned)
}

async function callKimi(apiKey, messages, maxTokens = 1500) {
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
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `请求失败（HTTP ${response.status}）`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function analyzePhoto(apiKey, imageDataUrl, roomType) {
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
          text: stage1Prompt(roomType),
        },
      ],
    },
  ], 1500)

  return parseJSON(content)
}

export async function synthesizeResults(apiKey, roomResults) {
  const content = await callKimi(apiKey, [
    {
      role: 'user',
      content: stage2Prompt(roomResults),
    },
  ], 2500)

  return parseJSON(content)
}
