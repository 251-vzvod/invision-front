import { NextResponse } from 'next/server'

const getApiBase = (): string | null => {
  const raw = process.env.API_URL
  return raw ? raw.replace(/\/$/, '') : null
}

interface FormResponse {
  id: number
  status: string
  program: { level: string; faculty_id: string | null }
  education: {
    english_proficiency: { type: string; score: number }
    school_certificate: { type: string; score: number }
  }
  personal_information: { gender: string; citizenship: string }
}

interface AnalyticsData {
  total: number
  byStatus: Record<string, number>
  byProgram: Record<string, number>
  byFaculty: Record<string, number>
  byGender: Record<string, number>
  avgEnglishScore: number
  avgUntScore: number
  englishScoreDistribution: Array<{ range: string; count: number }>
  untScoreDistribution: Array<{ range: string; count: number }>
}

function computeAnalytics(forms: FormResponse[]): AnalyticsData {
  const total = forms.length
  if (total === 0) {
    return {
      total: 0,
      byStatus: {},
      byProgram: {},
      byFaculty: {},
      byGender: {},
      avgEnglishScore: 0,
      avgUntScore: 0,
      englishScoreDistribution: [],
      untScoreDistribution: [],
    }
  }

  const byStatus: Record<string, number> = {}
  const byProgram: Record<string, number> = {}
  const byFaculty: Record<string, number> = {}
  const byGender: Record<string, number> = {}
  let totalEnglish = 0
  let totalUnt = 0

  for (const form of forms) {
    byStatus[form.status] = (byStatus[form.status] ?? 0) + 1
    byProgram[form.program.level] = (byProgram[form.program.level] ?? 0) + 1

    const faculty = form.program.faculty_id ?? 'foundation'
    byFaculty[faculty] = (byFaculty[faculty] ?? 0) + 1

    const gender = form.personal_information.gender
    byGender[gender] = (byGender[gender] ?? 0) + 1

    totalEnglish += form.education.english_proficiency.score
    totalUnt += form.education.school_certificate.score
  }

  // English score distribution (IELTS-style buckets)
  const englishBuckets: Record<string, number> = {
    '0-3': 0,
    '3.5-5': 0,
    '5.5-6.5': 0,
    '7-8': 0,
    '8.5-9': 0,
  }
  for (const form of forms) {
    const s = form.education.english_proficiency.score
    if (s <= 3) englishBuckets['0-3']++
    else if (s <= 5) englishBuckets['3.5-5']++
    else if (s <= 6.5) englishBuckets['5.5-6.5']++
    else if (s <= 8) englishBuckets['7-8']++
    else englishBuckets['8.5-9']++
  }

  // UNT score distribution
  const untBuckets: Record<string, number> = {
    '0-50': 0,
    '51-80': 0,
    '81-100': 0,
    '101-120': 0,
    '121-140': 0,
  }
  for (const form of forms) {
    const s = form.education.school_certificate.score
    if (s <= 50) untBuckets['0-50']++
    else if (s <= 80) untBuckets['51-80']++
    else if (s <= 100) untBuckets['81-100']++
    else if (s <= 120) untBuckets['101-120']++
    else untBuckets['121-140']++
  }

  return {
    total,
    byStatus,
    byProgram,
    byFaculty,
    byGender,
    avgEnglishScore: Math.round((totalEnglish / total) * 2) / 2,
    avgUntScore: Math.round(totalUnt / total),
    englishScoreDistribution: Object.entries(englishBuckets).map(([range, count]) => ({
      range,
      count,
    })),
    untScoreDistribution: Object.entries(untBuckets).map(([range, count]) => ({
      range,
      count,
    })),
  }
}

export async function GET() {
  const base = getApiBase()
  if (!base) {
    return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 })
  }

  try {
    const backendResponse = await fetch(`${base}/api/v1/forms?page=1&size=100`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const contentType = backendResponse.headers.get('content-type')
    const responseBody = contentType?.includes('application/json')
      ? await backendResponse.json()
      : await backendResponse.text()

    if (!backendResponse.ok) {
      const message =
        typeof responseBody === 'object' && responseBody && 'detail' in responseBody
          ? String(responseBody.detail)
          : 'Failed to fetch forms for analytics'

      return NextResponse.json({ message }, { status: backendResponse.status })
    }

    const forms = Array.isArray(responseBody) ? responseBody : []
    const analytics = computeAnalytics(forms)

    return NextResponse.json(analytics, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
