import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import StepAccount from '@/features/onboarding/StepAccount'
import StepPin from '@/features/onboarding/StepPin'
import StepApiChoice from '@/features/onboarding/StepApiChoice'
import Loading from '@/components/Loading'

type Step = 1 | 2 | 3

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true })
    } else if (!loading && user?.onboarding_complete) {
      navigate('/browse', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) return <Loading fullPage message="Loading…" />
  if (!user) return null

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((step + 1) as Step)
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  function handleComplete() {
    navigate('/browse', { replace: true })
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress indicator */}
        <div className="onboarding-progress">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`progress-step ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
            >
              <div className="progress-circle">{s < step ? '✓' : s}</div>
              <span className="progress-label">
                {s === 1 ? 'Account' : s === 2 ? 'Security' : 'API Choice'}
              </span>
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && <StepAccount onNext={handleNext} />}
        {step === 2 && <StepPin onNext={handleNext} onBack={handleBack} />}
        {step === 3 && (
          <StepApiChoice onComplete={handleComplete} onBack={handleBack} />
        )}
      </div>
    </div>
  )
}
