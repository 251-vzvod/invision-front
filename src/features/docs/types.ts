export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type CodeLanguage = 'python' | 'curl' | 'javascript'

export interface PathParam {
  name: string
  type: string
  description: string
  required: boolean
}

export interface QueryParam {
  name: string
  type: string
  description: string
  required: boolean
  default?: string | number
}

export interface Endpoint {
  id: string
  method: HttpMethod
  path: string
  summary: string
  description: string
  tag: string
  pathParams: PathParam[]
  queryParams: QueryParam[]
  requestBody: string | null
  responseExample: string
  contentType?: string
  /** Override the global base URL for this endpoint (e.g. ML service) */
  baseUrlOverride?: string
}

export interface EndpointGroup {
  tag: string
  description: string
  endpoints: Endpoint[]
}
