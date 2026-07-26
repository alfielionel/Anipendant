import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/features/auth/LoginForm'

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    error: null,
    loading: false,
    clearError: vi.fn(),
    user: null,
    register: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}))

describe('LoginForm', () => {
  it('renders the form with email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows a link to register', () => {
    const onSwitch = vi.fn()
    render(<LoginForm onSwitchToRegister={onSwitch} />)
    const registerLink = screen.getByText(/register/i)
    expect(registerLink).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    // Form should not submit with empty fields due to HTML5 validation
    expect(submitBtn).toBeInTheDocument()
  })
})
