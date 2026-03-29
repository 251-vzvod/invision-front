import { CheckCircle2 } from 'lucide-react'
import type { ChatMessage } from '../types'

interface InternalTestFinishedProps {
  history: ChatMessage[]
}

export function InternalTestFinished({ history }: InternalTestFinishedProps) {
  const finalMessage = [...history]
    .reverse()
    .find((entry) => entry.sender === 'Agent' && entry.question_id === 0)?.text

  return (
    <section className="flex min-h-105 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="relative mb-6">
        <span
          className="bg-success-2 absolute inset-0 animate-ping rounded-full"
          aria-hidden="true"
        />
        <span className="bg-success-1 relative flex size-20 items-center justify-center rounded-full border">
          <CheckCircle2 className="text-success-10 size-10" />
        </span>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">Internal Test Completed</h2>

      <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6 sm:text-base">
        {finalMessage ||
          'Thank you for completing the internal test. Your applicant profile has been fully submitted. Our admissions team will review your information and contact you with the next update.'}
      </p>
    </section>
  )
}
