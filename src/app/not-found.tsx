import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export default function NotFound() {
  return (
    <div className="bg-dashboard">
      <main className="mx-auto flex h-screen max-w-[1440px] flex-col items-center justify-center space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-primary text-sm font-semibold tracking-[0.35em] uppercase">404</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Page Lost In Transit
          </h1>
          <p className="mt-3 text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            The route you requested does not exist or was moved. Use one of the actions below to
            return to an active section.
          </p>
        </div>

        {/* Image block */}
        <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 dark:backdrop-blur-xl p-4">
          <Image
            src="/notfound.svg"
            alt="404 illustration"
            width={1123}
            height={444}
            priority
            className="h-auto w-full dark:invert-0 invert"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="min-w-56">
            <Link href="/applicants">Go To Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-44">
            <Link href="/auth">Open Sign In</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
