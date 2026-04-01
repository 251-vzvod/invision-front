export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
}

const isJsonContentType = (contentType: string | null): boolean => {
  if (!contentType) {
    return false
  }

  return contentType.toLowerCase().includes('application/json')
}

const parseResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type')
  if (isJsonContentType(contentType)) {
    return response.json()
  }

  const text = await response.text()
  return text || null
}

const normalizeBody = (body: unknown): BodyInit | undefined => {
  if (body == null) {
    return undefined
  }

  if (body instanceof FormData) {
    return body
  }

  return JSON.stringify(body)
}

export async function apiRequest<TResponse>(
  url: string,
  { method = 'GET', headers, body, signal }: ApiRequestOptions = {},
): Promise<TResponse> {
  const isFormData = body instanceof FormData
  const response = await fetch(url, {
    method,
    signal,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: normalizeBody(body),
  })

  const parsed = await parseResponse(response)
  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String(parsed.message)
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, parsed)
  }

  return parsed as TResponse
}

export const apiClient = {
  get: <TResponse>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse>(url, { ...options, method: 'GET' }),
  post: <TResponse>(
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>,
  ) => apiRequest<TResponse>(url, { ...options, method: 'POST', body }),
  put: <TResponse>(
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>,
  ) => apiRequest<TResponse>(url, { ...options, method: 'PUT', body }),
  patch: <TResponse>(
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>,
  ) => apiRequest<TResponse>(url, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<TResponse>(url, { ...options, method: 'DELETE' }),
}
