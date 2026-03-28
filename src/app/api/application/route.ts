import { NextResponse } from 'next/server'

interface BackendErrorResponse {
  message?: string
}

const getBackendEndpoint = (): string | null => {
  const rawValue = process.env.BACKEND_API
  if (!rawValue) {
    return null
  }

  return `${rawValue.replace(/\/$/, '')}/applications`
}

export async function POST(request: Request) {
  const endpoint = getBackendEndpoint()
  if (!endpoint) {
    return NextResponse.json({ message: 'BACKEND_API is not configured' }, { status: 500 })
  }

  try {
    const payload = await request.json()
    const backendResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const contentType = backendResponse.headers.get('content-type')
    const responseBody = contentType?.includes('application/json')
      ? await backendResponse.json()
      : await backendResponse.text()

    if (!backendResponse.ok) {
      const message =
        typeof responseBody === 'object' && responseBody && 'message' in responseBody
          ? String((responseBody as BackendErrorResponse).message)
          : 'Failed to send application'

      return NextResponse.json(
        {
          message,
          details: responseBody,
        },
        { status: backendResponse.status },
      )
    }

    return NextResponse.json(responseBody, { status: backendResponse.status })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 },
    )
  }
}
