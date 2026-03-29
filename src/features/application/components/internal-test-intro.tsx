import { Button } from '@/shared/ui/button'

interface InternalTestIntroProps {
  onStart: () => void
  isStarting: boolean
  error: string | null
}

export function InternalTestIntro({ onStart, isStarting, error }: InternalTestIntroProps) {
  return (
    <section className="space-y-6 p-4 sm:p-6">
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
        <div className="border-destructive/25 bg-destructive/10 rounded-xl border px-4 py-3">
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        disabled={isStarting}
        onClick={onStart}
        className="w-full rounded-xl sm:w-auto"
      >
        {isStarting ? 'Starting...' : 'Start Test'}
      </Button>
    </section>
  )
}
