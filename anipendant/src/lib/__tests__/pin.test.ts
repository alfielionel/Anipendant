import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  touchLastActivity,
  getLastActivityTimestamp,
  isPastIdleThreshold,
  isLockedOut,
  recordFailedAttempt,
  clearFailedAttempts,
  getRemainingLockoutSeconds,
} from '@/lib/pin'

const STORAGE_KEY_ACTIVITY = 'anipendant_last_activity'
const STORAGE_KEY_LOCKOUT = 'anipendant_lockout_until'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('touchLastActivity / getLastActivityTimestamp', () => {
  it('stores the current timestamp', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    touchLastActivity()
    expect(getLastActivityTimestamp()).toBe(Date.now())
  })

  it('returns null when no activity stored', () => {
    expect(getLastActivityTimestamp()).toBeNull()
  })
})

describe('isPastIdleThreshold', () => {
  it('returns true when no prior activity', () => {
    expect(isPastIdleThreshold(null)).toBe(true)
  })

  it('returns false when within 30 minutes', () => {
    const now = Date.now()
    const recent = now - 10 * 60 * 1000 // 10 min ago
    expect(isPastIdleThreshold(recent)).toBe(false)
  })

  it('returns true when past 30 minutes', () => {
    const now = Date.now()
    const old = now - 45 * 60 * 1000 // 45 min ago
    expect(isPastIdleThreshold(old)).toBe(true)
  })

  it('returns false exactly at 30 minutes boundary (strictly greater)', () => {
    const now = Date.now()
    const boundary = now - 30 * 60 * 1000
    // Uses `>` not `>=`, so at exactly 30 min it's not yet past
    expect(isPastIdleThreshold(boundary)).toBe(false)
  })
})

describe('recordFailedAttempt / clearFailedAttempts', () => {
  it('returns false after 4 failed attempts', () => {
    for (let i = 0; i < 4; i++) {
      expect(recordFailedAttempt()).toBe(false)
    }
  })

  it('returns true on the 5th failed attempt (lockout triggered)', () => {
    for (let i = 0; i < 5; i++) {
      const result = recordFailedAttempt()
      if (i < 4) expect(result).toBe(false)
      else expect(result).toBe(true)
    }
  })

  it('clears failed attempts', () => {
    for (let i = 0; i < 3; i++) recordFailedAttempt()
    clearFailedAttempts()
    // Next attempt should be the 1st again
    expect(recordFailedAttempt()).toBe(false)
  })
})

describe('isLockedOut / getRemainingLockoutSeconds', () => {
  it('returns false when no lockout stored', () => {
    expect(isLockedOut()).toBe(false)
    expect(getRemainingLockoutSeconds()).toBe(0)
  })

  it('returns true during lockout period', () => {
    recordFailedAttempt()
    recordFailedAttempt()
    recordFailedAttempt()
    recordFailedAttempt()
    recordFailedAttempt() // triggers lockout
    expect(isLockedOut()).toBe(true)
    expect(getRemainingLockoutSeconds()).toBeGreaterThan(0)
    expect(getRemainingLockoutSeconds()).toBeLessThanOrEqual(60)
  })

  it('clears lockout after 60 seconds', () => {
    recordFailedAttempt()
    recordFailedAttempt()
    recordFailedAttempt()
    recordFailedAttempt()
    recordFailedAttempt() // triggers lockout

    expect(isLockedOut()).toBe(true)

    // Advance time past lockout
    vi.advanceTimersByTime(61000)
    // The isLockedOut function checks Date.now() against stored timestamp
    // It should now return false since lockout has expired
    // But we need to call it again after time passes
    // The issue is that localStorage still has the lockout value
    // isLockedOut() checks Date.now() >= lockoutEnd and removes it
    expect(isLockedOut()).toBe(false)
    expect(getRemainingLockoutSeconds()).toBe(0)
  })
})
