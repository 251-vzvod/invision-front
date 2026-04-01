import { CheckCircle2, PartyPopper } from 'lucide-react'

export function InternalTestFinished() {
  return (
    <section className="flex min-h-105 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mx-auto max-w-lg">
        <div className="relative mx-auto mb-8 w-fit">
          <span
            className="bg-success-2 absolute inset-0 animate-ping rounded-full"
            aria-hidden="true"
          />
          <span className="bg-success-1 relative flex size-20 items-center justify-center rounded-full border">
            <CheckCircle2 className="text-success-10 size-10" />
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          All Stages Completed!
        </h2>

        <div className="mt-4 space-y-3">
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            You have successfully completed all stages of the application process — your form
            has been submitted and the interview with our AI agent is finished.
          </p>

          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Our admissions team will now review your application. We will reach out to you
            with updates as soon as possible.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2.5">
            <PartyPopper className="size-5 text-amber-500" />
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Good luck! We wish you the best.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
