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

    const res = await fetch(`${base}/api/v1/rankings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const contentType = res.headers.get('content-type')
    const body = contentType?.includes('application/json') ? await res.json() : await res.text()

    if (!res.ok) {
      const msg =
        typeof body === 'object' && body && 'detail' in body
          ? String((body as Record<string, unknown>).detail)
          : 'Failed to start ranking'

      return NextResponse.json({ message: msg }, { status: res.status })
    }

    return NextResponse.json(body, { status: 202 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
