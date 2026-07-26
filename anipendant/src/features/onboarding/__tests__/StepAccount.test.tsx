import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StepAccount from '@/features/onboarding/StepAccount'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-id', username: 'testuser', selected_api: 'anilist', email: 'test@test.com', onboarding_complete: false, pin_hash: null, pin_security_question: null, pin_security_answer_hash: null, last_activity: null, created_at: new Date().toISOString() },
    refreshProfile: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    rpc: vi.fn(),
  },
}))

describe('StepAccount', () => {
  it('renders the account step', () => {
    render(<StepAccount onNext={vi.fn()} />)
    expect(screen.getByText('Welcome to Anipendant!')).toBeInTheDocument()
  })

  it('shows username input', () => {
    render(<StepAccount onNext={vi.fn()} />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('shows continue button', () => {
    render(<StepAccount onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
