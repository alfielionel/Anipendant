const STORAGE_KEY_LAST_ACTIVITY = 'anipendant_last_activity'
const PIN_TIMEOUT_MINUTES = 30
const MAX_PIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 60_000
const STORAGE_KEY_LOCKOUT_UNTIL = 'anipendant_lockout_until'

/**
 * Update the last-activity timestamp in localStorage.
 * Called on every meaningful user action (route change, click).
 */
export function touchLastActivity(): void {
  const now = Date.now().toString()
  localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now)
}

/**
 * Get the stored last-activity timestamp, or null.
 */
export function getLastActivityTimestamp(): number | null {
  const stored = localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY)
  return stored ? parseInt(stored, 10) : null
}

/**
 * Returns true if the user has been idle past the threshold.
 */
export function isPastIdleThreshold(lastActivity: number | null): boolean {
  if (lastActivity === null) return true // no prior activity → prompt PIN
  const elapsed = Date.now() - lastActivity
  return elapsed > PIN_TIMEOUT_MINUTES * 60 * 1000
}

/**
 * Check if the user is currently in lockout.
 */
export function isLockedOut(): boolean {
  const until = localStorage.getItem(STORAGE_KEY_LOCKOUT_UNTIL)
  if (!until) return false
  const lockoutEnd = parseInt(until, 10)
  if (Date.now() >= lockoutEnd) {
    localStorage.removeItem(STORAGE_KEY_LOCKOUT_UNTIL)
    return false
  }
  return true
}

/**
 * Record a failed PIN attempt. Returns true if now locked out.
 */
export function recordFailedAttempt(): boolean {
  const key = 'anipendant_failed_attempts'
  const attempts = parseInt(localStorage.getItem(key) || '0', 10) + 1
  localStorage.setItem(key, attempts.toString())
  if (attempts >= MAX_PIN_ATTEMPTS) {
    const lockoutUntil = (Date.now() + LOCKOUT_DURATION_MS).toString()
    localStorage.setItem(STORAGE_KEY_LOCKOUT_UNTIL, lockoutUntil)
    localStorage.removeItem(key) // reset counter after lockout triggered
    return true
  }
  return false
}

/**
 * Clear failed attempt tracking (call on successful PIN entry).
 */
export function clearFailedAttempts(): void {
  localStorage.removeItem('anipendant_failed_attempts')
}

/**
 * Get remaining lockout time in seconds (0 if not locked out).
 */
export function getRemainingLockoutSeconds(): number {
  const until = localStorage.getItem(STORAGE_KEY_LOCKOUT_UNTIL)
  if (!until) return 0
  const remaining = Math.ceil((parseInt(until, 10) - Date.now()) / 1000)
  return Math.max(0, remaining)
}
