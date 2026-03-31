import { Button } from '@/shared/ui/button'
import { Sparkles } from 'lucide-react'

interface InternalTestIntroProps {
  onStart: () => void
  isStarting: boolean
  error: string | null
}

export function InternalTestIntro({ onStart, isStarting, error }: InternalTestIntroProps) {
  return (
    <section className="flex items-center justify-center p-6 sm:p-10">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="text-primary size-7" />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Mandatory Internal Test</h2>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            You are required to complete a short interview with our AI agent. The test usually
            includes around 15 questions designed to identify your strongest skills and potential.
          </p>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Please do not worry and answer each question carefully. Detailed and thoughtful responses
            will help us review your application more accurately.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        <Button
          type="button"
          size="lg"
          disabled={isStarting}
          onClick={onStart}
          className="h-12 w-full rounded-xl text-base sm:w-auto sm:px-10"
        >
          {isStarting ? 'Starting...' : 'Start Test'}
        </Button>
      </div>
    </section>
  )
}
