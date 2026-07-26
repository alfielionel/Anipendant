import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  touchLastActivity,
  getLastActivityTimestamp,
  isPastIdleThreshold,
  isLockedOut,
  recordFailedAttempt,
  clearFailedAttempts,
  getRemainingLockoutSeconds,
} from '@/lib/pin'

export interface PinGuardState {
  needsPin: boolean
  lockedOut: boolean
  lockoutSeconds: number
  verifyPin: (pin: string) => Promise<boolean>
  resetPin: (newPin: string) => Promise<boolean>
}

export function usePinGuard(): PinGuardState {
  const { user } = useAuth()
  const needsRef = useRef(false)

  const needsPin = user !== null && isPastIdleThreshold(getLastActivityTimestamp())
  needsRef.current = needsPin

  const lockedOut = isLockedOut()
  const lockoutSeconds = getRemainingLockoutSeconds()

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!user) return false
    if (isLockedOut()) return false

    const { data, error } = await supabase.rpc('verify_pin', {
      p_user_id: user.id,
      p_pin: pin,
    })

    if (error) {
      console.error('PIN verification error:', error)
      return false
    }

    if (data) {
      touchLastActivity()
      clearFailedAttempts()
      // Update last_activity in DB
      await supabase.rpc('update_last_activity', { p_user_id: user.id })
      needsRef.current = false
      return true
    }

    const lockedOut = recordFailedAttempt()
    if (lockedOut) {
      // Force re-render by toggling state
    }
    return false
  }, [user])

  const resetPin = useCallback(async (newPin: string): Promise<boolean> => {
    if (!user) return false
    const { error } = await supabase.rpc('update_pin', {
      p_user_id: user.id,
      p_current_pin: '',
      p_new_pin: newPin,
    })
    if (error) {
      console.error('PIN reset error:', error)
      return false
    }
    touchLastActivity()
    clearFailedAttempts()
    needsRef.current = false
    return true
  }, [user])

  // Auto touch activity on mount (if PIN not needed)
  useEffect(() => {
    if (!needsPin) {
      touchLastActivity()
    }
  }, [needsPin])

  return { needsPin, lockedOut, lockoutSeconds, verifyPin, resetPin }
}
