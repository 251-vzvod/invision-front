import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(166,216,10,0.2)_0%,rgba(15,23,42,0.1)_35%,#0f172a_100%)] px-6 py-10">
      <style>{`[data-slot="sidebar-wrapper"] { display: contents !important; } [data-slot="sidebar"], [data-slot="sidebar-gap"] { display: none !important; } [data-slot="sidebar-inset"] > header { display: none !important; }`}</style>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <Card className="border-border/70 w-full rounded-2xl border bg-[#ececec] shadow-2xl">
          <CardContent className="space-y-8 p-8 text-center sm:p-10">
            <div className="space-y-3">
              <p className="text-primary text-sm font-semibold tracking-[0.35em] uppercase">404</p>
              <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-6xl">
                Page Lost In Transit
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
                The route you requested does not exist or was moved. Use one of the actions below to
                return to an active section.
              </p>
            </div>

            <div className="border-primary/20 overflow-hidden rounded-2xl border bg-[#101218] p-3 sm:p-4">
              <Image
                src="/notfound.svg"
                alt="404 illustration"
                width={1123}
                height={444}
                priority
                className="h-auto w-full"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="min-w-56">
                <Link href="/applicants">Go To Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-44">
                <Link href="/auth">Open Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
