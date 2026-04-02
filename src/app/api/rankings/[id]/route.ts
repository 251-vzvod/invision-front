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

  const { id } = await params

  try {
    const res = await fetch(`${base}/api/v1/rankings/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const contentType = res.headers.get('content-type')
    const body = contentType?.includes('application/json') ? await res.json() : await res.text()

    if (!res.ok) {
      const msg =
        typeof body === 'object' && body && 'detail' in body
          ? String((body as Record<string, unknown>).detail)
          : 'Failed to fetch ranking'

      return NextResponse.json({ message: msg }, { status: res.status })
    }

    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
