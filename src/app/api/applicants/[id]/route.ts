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
    const encodedId = encodeURIComponent(id)

    // Fetch form data and ML assessment in parallel
    const [formResponse, mlResponse] = await Promise.all([
      fetch(`${base}/api/v1/forms/${encodedId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch(`${base}/api/v1/forms/${encodedId}/ml-assessment`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    ])

    // Parse form response
    let form = null
    if (formResponse.ok) {
      const contentType = formResponse.headers.get('content-type')
      form = contentType?.includes('application/json') ? await formResponse.json() : null
    } else if (formResponse.status !== 404) {
      const contentType = formResponse.headers.get('content-type')
      const responseBody = contentType?.includes('application/json')
        ? await formResponse.json()
        : await formResponse.text()

      const message =
        typeof responseBody === 'object' && responseBody && 'detail' in responseBody
          ? String(responseBody.detail)
          : 'Failed to fetch applicant form'

      return NextResponse.json(
        { message, details: responseBody },
        { status: formResponse.status },
      )
    }

    // Parse ML assessment response (404 is expected if not yet scored)
    let ml_assessment = null
    if (mlResponse.ok) {
      const contentType = mlResponse.headers.get('content-type')
      ml_assessment = contentType?.includes('application/json') ? await mlResponse.json() : null
    }

    return NextResponse.json({ form, ml_assessment }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}
