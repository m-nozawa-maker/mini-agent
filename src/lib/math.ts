export const gcd = (a: number, b: number): number => {
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

export const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b)
}

export const getPrimes = (n: number): number[] => {
  if (n < 2) return []
  const isPrime = Array<boolean>(n + 1).fill(true)
  isPrime[0] = false
  isPrime[1] = false
  for (let i = 2; i * i <= n; i++) {
    if (!isPrime[i]) continue
    for (let j = i * i; j <= n; j += i) {
      isPrime[j] = false
    }
  }
  return isPrime.flatMap((prime, index) => prime ? [index] : [])
}
