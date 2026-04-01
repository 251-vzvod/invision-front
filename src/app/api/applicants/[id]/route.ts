import { NextResponse } from 'next/server'

const getApiBase = (): string | null => {
  const raw = process.env.API_URL
  return raw ? raw.replace(/\/$/, '') : null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const base = getApiBase()
  if (!base) {
    return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 })
  }

  try {
    const { id } = await params
    const backendResponse = await fetch(`${base}/api/v1/forms/${encodeURIComponent(id)}`, {
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
          : 'Failed to fetch applicant'

      return NextResponse.json(
        { message, details: responseBody },
        { status: backendResponse.status },
      )
    }

    return NextResponse.json(responseBody, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
