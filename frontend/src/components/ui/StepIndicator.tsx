'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export interface Step {
  id?: string | number;
  title?: string;
  label?: string;
  description?: string;
  status?: 'completed' | 'current' | 'pending';
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  showNumbers?: boolean;
  showDescriptions?: boolean;
  renderStep?: (step: Step, index: number, status: 'completed' | 'current' | 'pending') => React.ReactNode;
}

// ============================================
// Icons
// ============================================

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// ============================================
// Component
// ============================================

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  showNumbers = true,
  showDescriptions = false,
}) => {
  const isVertical = orientation === 'vertical';

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getStepStyles = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-success text-white border-success',
          line: 'bg-success',
          title: 'text-success dark:text-success font-semibold',
          description: 'text-neutral-500 dark:text-neutral-400',
        };
      case 'current':
        return {
          circle: 'bg-primary-500 text-white border-primary-500',
          line: 'bg-neutral-200 dark:bg-neutral-700',
          title: 'text-neutral-900 dark:text-neutral-100 font-semibold',
          description: 'text-neutral-600 dark:text-neutral-400',
        };
      case 'pending':
        return {
          circle: 'bg-white dark:bg-neutral-800 text-neutral-400 border-neutral-300 dark:border-neutral-600',
          line: 'bg-neutral-200 dark:bg-neutral-700',
          title: 'text-neutral-500 dark:text-neutral-400',
          description: 'text-neutral-400 dark:text-neutral-500',
        };
    }
  };

  return (
    <div
      className={`
        ${isVertical ? 'flex flex-col' : 'flex items-center'}
      `}
      role="navigation"
      aria-label="Progress steps"
    >
       {steps.map((step, index) => {
         const status = getStepStatus(index);
         const styles = getStepStyles(status);
         const isClickable = !!onStepClick && status !== 'pending';
         const isLastStep = index === steps.length - 1;

         const StepCircle = () => (
           <div
             className={`
               flex items-center justify-center w-10 h-10 rounded-full
               border-2 font-semibold text-sm
               transition-all duration-300
               ${styles.circle}
               ${isClickable ? 'cursor-pointer hover:scale-110' : ''}
             `}
             aria-current={status === 'current' ? 'step' : undefined}
           >
             {status === 'completed' ? (
               <CheckIcon />
             ) : showNumbers ? (
               index + 1
             ) : null}
           </div>
         );

         return (
           <div
             key={step.id !== undefined ? step.id : index}
             className={`
               ${isVertical ? 'flex items-start' : 'flex items-center flex-1'}
               ${isClickable ? 'cursor-pointer' : ''}
             `}
             onClick={() => isClickable && onStepClick?.(index)}
           >
            {/* Step Circle and Label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  relative z-10
                  ${isVertical ? 'mb-2' : ''}
                `}
              >
                {isClickable ? (
                  <button
                    type="button"
                    className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
                    onClick={() => onStepClick?.(index)}
                    aria-label={`Step ${index + 1}: ${step.title || step.label}${status === 'completed' ? ' (completed)' : status === 'current' ? ' (current)' : ''}`}
                  >
                    <StepCircle />
                  </button>
                ) : (
                  <StepCircle />
                )}
              </div>

              {/* Label and Description */}
              <div
                className={`
                  text-center
                  ${isVertical ? 'mb-4' : 'absolute w-32 -mt-2'}
                `}
              >
                <span className={`text-sm ${styles.title}`}>
                  {step.title || step.label}
                </span>
                {showDescriptions && step.description && (
                  <p className={`text-xs mt-0.5 max-w-[150px] mx-auto ${styles.description}`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLastStep && (
              <div
                className={`
                  flex-1
                  ${isVertical ? 'w-0.5 h-12 ml-4' : 'h-0.5 mx-2'}
                  ${styles.line}
                  transition-all duration-300
                `}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

StepIndicator.displayName = 'StepIndicator';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * StepIndicator Component Usage:
 * 
 * // Basic usage
 * const steps = [
 *   { id: 1, title: 'Verify Identity' },
 *   { id: 2, title: 'Cast Vote' },
 *   { id: 3, title: 'Confirmation' },
 * ];
 * 
 * <StepIndicator steps={steps} currentStep={1} />
 * 
 * // With descriptions
 * <StepIndicator 
 *   steps={steps} 
 *   currentStep={1} 
 *   showDescriptions 
 * />
 * 
 * // Vertical orientation
 * <StepIndicator 
 *   steps={steps} 
 *   currentStep={1} 
 *   orientation="vertical" 
 * />
 * 
 * // Without numbers (just checkmarks)
 * <StepIndicator 
 *   steps={steps} 
 *   currentStep={2} 
 *   showNumbers={false} 
 * />
 * 
 * // With click handlers
 * const handleStepClick = (index) => console.log('Clicked step', index);
 * <StepIndicator 
 *   steps={steps} 
 *   currentStep={1} 
 *   onStepClick={handleStepClick} 
 * />
 */
