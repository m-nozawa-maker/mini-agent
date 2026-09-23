import { z } from 'zod'
import type { Tool } from './tool'
import { getPrimes } from '../lib/math'

// その数までの素数を列挙する
export const primesSchema = z.object({
  number: z.number().int().min(2).describe('素数を列挙する数')
})

export const primesTool: Tool = {
  name: 'primes',
  description: 'その数までの素数を列挙します。',
  parameter: `
z.object({
  number: z.number().int().min(2).describe('素数を列挙する数')
})`,
  execute: async (args: string) => {
    const validatedData = primesSchema.parse(JSON.parse(args))
    const primes = getPrimes(validatedData.number)
    return `素数: ${primes}`
  }
}
