import { NextResponse } from 'next/server'

interface BackendErrorResponse {
  message?: string
}

const getBackendEndpoint = (): string | null => {
  const rawValue = process.env.BACKEND_API
  if (!rawValue) {
    return null
  }

  return `${rawValue.replace(/\/$/, '')}/file`
}

const parseBackendResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function POST(request: Request) {
  const endpoint = getBackendEndpoint()
  if (!endpoint) {
    return NextResponse.json({ message: 'BACKEND_API is not configured' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const backendResponse = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    const responseBody = await parseBackendResponse(backendResponse)

    if (!backendResponse.ok) {
      const message =
        typeof responseBody === 'object' && responseBody && 'message' in responseBody
          ? String((responseBody as BackendErrorResponse).message)
          : 'Failed to upload file'

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

export async function DELETE(request: Request) {
  const endpoint = getBackendEndpoint()
  if (!endpoint) {
    return NextResponse.json({ message: 'BACKEND_API is not configured' }, { status: 500 })
  }

  try {
    const payload = await request.json()
    const backendResponse = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseBody = await parseBackendResponse(backendResponse)

    if (!backendResponse.ok) {
      const message =
        typeof responseBody === 'object' && responseBody && 'message' in responseBody
          ? String((responseBody as BackendErrorResponse).message)
          : 'Failed to delete file'

      return NextResponse.json(
        {
          message,
          details: responseBody,
        },
        { status: backendResponse.status },
      )
    }

    if (typeof responseBody === 'string' && !responseBody) {
      return new NextResponse(null, { status: backendResponse.status })
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
