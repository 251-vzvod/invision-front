import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export const metadata: Metadata = {
  title: 'InVision — Admission Intelligence',
  description: 'Landing page for applicants and admissions managers',
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_8%_12%,rgba(166,216,10,0.2)_0%,transparent_38%),radial-gradient(circle_at_88%_8%,rgba(193,241,29,0.15)_0%,transparent_42%),linear-gradient(180deg,#f8fafc_0%,#f3f8df_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-primary/20 bg-background/90 shadow-sm backdrop-blur">
            <CardHeader className="space-y-4">
              <p className="border-primary/35 bg-primary/10 text-foreground inline-flex w-fit rounded-full border px-4 py-1.5 text-sm font-medium">
                InVision Platform
              </p>
              <CardTitle className="text-3xl leading-tight sm:text-4xl">
                Smart admission workspace for applicants and managers
              </CardTitle>
              <CardDescription className="text-base leading-relaxed sm:text-lg">
                InVision combines application data, structured scoring, and explainable signals to
                help teams review candidates faster and more consistently.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/85 text-base">
                Applicants can submit forms in a clear flow, while managers get ranked profiles,
                eligibility context, and score breakdowns in one interface.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg" className="h-12 text-base font-semibold">
                  <Link href="/form">I am an applicant</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 text-base font-semibold"
                >
                  <Link href="/applicants">I am a manager</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 from-background/95 to-primary/10 bg-linear-to-b shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">What you get</CardTitle>
              <CardDescription>Fast, transparent and role-based admission workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-base">
              <div className="border-primary/20 bg-background/70 rounded-xl border px-4 py-3">
                Unified candidate profile with evidence spans and explanation notes.
              </div>
              <div className="border-primary/20 bg-background/70 rounded-xl border px-4 py-3">
                Eligibility statuses with clear reasons and missing material routing.
              </div>
              <div className="border-primary/20 bg-background/70 rounded-xl border px-4 py-3">
                Merit, confidence and risk metrics visualized for easier decision-making.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
