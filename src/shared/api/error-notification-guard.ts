import type { AppError } from './errors'

const dedupeWindowMs = 5000
const maximumTrackedErrors = 100
const recentErrors = new Map<string, number>()

export function shouldShowAppErrorNotification(
  error: AppError,
  now = Date.now(),
): boolean {
  const key = `${error.status}:${error.kind}:${error.title}:${error.detail}`
  const previousTime = recentErrors.get(key)

  if (previousTime !== undefined && now - previousTime < dedupeWindowMs) {
    return false
  }

  recentErrors.set(key, now)

  for (const [recentKey, timestamp] of recentErrors) {
    if (now - timestamp >= dedupeWindowMs) {
      recentErrors.delete(recentKey)
    }
  }

  if (recentErrors.size > maximumTrackedErrors) {
    const oldestKey = recentErrors.keys().next().value

    if (oldestKey !== undefined) {
      recentErrors.delete(oldestKey)
    }
  }

  return true
}
