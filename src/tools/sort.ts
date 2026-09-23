import { z } from 'zod'
import type { Tool } from './tool'

function sortArray (array: number[]): number[] {
  return [...array].sort((a, b) => a - b)
}

export const sortSchema = z.object({
  array: z.array(z.number()).describe('昇順にソートする数値の配列')
})

export const sortTool: Tool = {
  name: 'sort',
  description: '数値の配列を昇順にソートします。',
  parameter: `
z.object({
  array: z.array(z.number()).describe('昇順にソートする数値の配列')
})`,
  execute: async (args: string) => {
    try {
      const validatedData = sortSchema.parse(JSON.parse(args))
      const sortedArray = sortArray(validatedData.array)
      return sortedArray.join(',')
    } catch (error) {
      if (error instanceof z.ZodError) {
        return `ソートエラー: ${error.errors.map(e => e.message).join(', ')}`
      }
      return `ソートエラー: ${error}`
    }
  }
}
