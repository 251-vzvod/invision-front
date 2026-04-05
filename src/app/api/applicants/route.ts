import { NextRequest, NextResponse } from 'next/server'

const getApiBase = (): string | null => {
  const raw = process.env.API_URL
  return raw ? raw.replace(/\/$/, '') : null
}

export async function GET(request: NextRequest) {
  const base = getApiBase()
  if (!base) {
    return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 })
  }

  try {
    const { searchParams } = request.nextUrl
    const page = searchParams.get('page') ?? '1'
    const size = searchParams.get('size') ?? '25'
    const sort = searchParams.get('sort') ?? 'DESC'
    const recommendation = searchParams.get('recommendation')
    const eligibility = searchParams.get('eligibility')
    const decision = searchParams.get('decision')

    const url = new URL(`${base}/api/v1/ml-assessments`)
    url.searchParams.set('page', page)
    url.searchParams.set('size', size)
    url.searchParams.set('sort', sort)
    if (recommendation) url.searchParams.set('recommendation', recommendation)
    if (eligibility) url.searchParams.set('eligibility', eligibility)
    if (decision) url.searchParams.set('decision', decision)

    const backendResponse = await fetch(
      url.toString(),
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    )

    const contentType = backendResponse.headers.get('content-type')
    const responseBody = contentType?.includes('application/json')
      ? await backendResponse.json()
      : await backendResponse.text()

    if (!backendResponse.ok) {
      const message =
        typeof responseBody === 'object' && responseBody && 'detail' in responseBody
          ? String(responseBody.detail)
          : 'Failed to fetch applicants'

      return NextResponse.json({ message, details: responseBody }, { status: backendResponse.status })
    }

    return NextResponse.json(responseBody, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
