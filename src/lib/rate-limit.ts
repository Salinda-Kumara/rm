// In-memory rate limiter (upgrade to Redis for production)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limiters = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of limiters.entries()) {
    if (entry.resetAt < now) {
      limiters.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

export const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 } as RateLimitConfig,    // 5 per 15 min
  api: { maxAttempts: 100, windowMs: 60 * 1000 } as RateLimitConfig,          // 100 per min
  upload: { maxAttempts: 10, windowMs: 60 * 60 * 1000 } as RateLimitConfig,   // 10 per hour
}

export function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = limiters.get(key)

  if (!entry || entry.resetAt < now) {
    limiters.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt: now + config.windowMs }
  }

  if (entry.count >= config.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: config.maxAttempts - entry.count, resetAt: entry.resetAt }
}
