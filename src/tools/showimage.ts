// 入力された文字列から画像を生成し、TEMP_DIRに保存する
import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import type { Tool } from './tool'
import { validateFilePath } from '../lib/file'

const IMAGE_MODEL = 'google/gemini-2.5-flash-image'

export const showImageSchema = z.object({
  text: z.string().describe('生成する画像の説明')
})

export const showImageTool: Tool = {
  name: 'showImage',
  description: 'テキストから画像を生成し、TEMP_DIRに保存します。保存したファイルパスを返します。',
  parameter: `
z.object({
  text: z.string().describe('生成する画像の説明')
})`,
  execute: async (args: string) => {
    try {
      const text = readPrompt(args)
      return await getImage(text)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return `画像生成エラー: ${error.errors.map(e => e.message).join(', ')}`
      }
      return `画像生成エラー: ${error}`
    }
  }
}

function readPrompt (args: string): string {
  const trimmed = args.trim()
  if (!trimmed) {
    throw new Error('画像の説明が空です')
  }
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (typeof parsed === 'string') return parsed
    return showImageSchema.parse(parsed).text
  } catch (error) {
    if (error instanceof SyntaxError) return trimmed
    throw error
  }
}

function extensionFor (mediaType: string | undefined): string {
  switch (mediaType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    case 'image/svg+xml':
      return 'svg'
    default:
      return 'png'
  }
}

async function getImage (text: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: text,
      n: 1
    })
  })
  const data = await response.json() as {
    data?: Array<{ b64_json?: string, media_type?: string }>
    error?: { message?: string }
  }
  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenRouter images API ${response.status}`)
  }
  const image = data.data?.[0]
  if (!image?.b64_json) {
    throw new Error('画像データが返りませんでした')
  }

  const filename = `image-${Date.now()}.${extensionFor(image.media_type)}`
  const filePath = validateFilePath(filename)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, Buffer.from(image.b64_json, 'base64'))
  return path.resolve(filePath)
}
