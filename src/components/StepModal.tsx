import { useState } from 'react'

type StepModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  steps: Array<{
    title: string
    content: string
  }>
  onFinish?: () => void
  showSkip?: boolean
  skipText?: string
  prevText?: string
  nextText?: string
  finishText?: string
}

export function StepModal({
  isOpen,
  onClose,
  title,
  steps,
  onFinish,
  showSkip = false,
  skipText = 'Skip',
  prevText = 'Previous',
  nextText = 'Next',
  finishText = 'Finish',
}: StepModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onFinish?.()
      onClose()
      setCurrentStep(0)
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSkip = () => {
    setCurrentStep(steps.length - 1)
  }

  const handleClose = () => {
    onClose()
    setCurrentStep(0)
  }

  const step = steps[currentStep]

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal step-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" type="button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <h3 className="step-title">{step.title}</h3>
          <p
            className="modal-text"
            dangerouslySetInnerHTML={{ __html: step.content }}
          />

          <div className="step-indicator">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'step-dot-active' : ''} ${
                  index < currentStep ? 'step-dot-completed' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer">
          {showSkip && !isLastStep && (
            <button
              type="button"
              className="control-btn control-btn-secondary"
              onClick={handleSkip}
            >
              {skipText}
            </button>
          )}

          <div className="modal-footer-right">
            {!isFirstStep && (
              <button
                type="button"
                className="control-btn control-btn-secondary"
                onClick={handlePrev}
              >
                {prevText}
              </button>
            )}

            <button
              type="button"
              className="control-btn control-btn-primary"
              onClick={handleNext}
            >
              {isLastStep ? finishText : nextText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
