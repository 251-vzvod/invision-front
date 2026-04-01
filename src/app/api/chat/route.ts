import { NextResponse } from 'next/server'

const getApiBase = (): string | null => {
  const raw = process.env.API_URL
  return raw ? raw.replace(/\/$/, '') : null
}

export async function POST(request: Request) {
  const base = getApiBase()
  if (!base) {
    return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 })
  }

  try {
    const payload = await request.json()
    const backendResponse = await fetch(`${base}/api/v1/agent/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.text ?? '',
        applicant_external_id: payload.applicant_external_id,
      }),
    })

    const contentType = backendResponse.headers.get('content-type')
    const responseBody = contentType?.includes('application/json')
      ? await backendResponse.json()
      : await backendResponse.text()

    if (!backendResponse.ok) {
      const message =
        typeof responseBody === 'object' && responseBody && 'detail' in responseBody
          ? String(responseBody.detail)
          : 'Agent reply failed'

      return NextResponse.json({ message, details: responseBody }, { status: backendResponse.status })
    }

    // Backend returns { message, status, question? }
    return NextResponse.json(responseBody, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
