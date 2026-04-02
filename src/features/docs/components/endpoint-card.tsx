'use client'

import { useCallback, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2, Play } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/shared/lib/utils'
import type { CodeLanguage, Endpoint, HttpMethod } from '../types'
import { CodeBlock } from './code-block'

// ─── Method colors ───
const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20',
  POST: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border-sky-500/20',
  PUT: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
  DELETE:
    'bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20',
}

// ─── Code generators ───
function generatePython(endpoint: Endpoint, baseUrl: string, paramValues: Record<string, string>): string {
  const resolvedPath = resolvePath(endpoint.path, paramValues)
  const effectiveBase = endpoint.baseUrlOverride ?? baseUrl
  const url = `${effectiveBase}${resolvedPath}`
  const queryString = buildQueryString(endpoint, paramValues)
  const fullUrl = queryString ? `${url}?${queryString}` : url

  if (endpoint.contentType === 'multipart/form-data') {
    return `import requests

response = requests.post(
    "${fullUrl}",
    files={"file": open("motivation-letter.pdf", "rb")}
)
print(response.json())`
  }

  if (endpoint.requestBody && endpoint.method !== 'GET') {
    return `import requests

response = requests.${endpoint.method.toLowerCase()}(
    "${fullUrl}",
    json=${endpoint.requestBody}
)
print(response.status_code)
print(response.json())`
  }

  return `import requests

response = requests.${endpoint.method.toLowerCase()}("${fullUrl}")
print(response.status_code)
print(response.json())`
}

function generateCurl(endpoint: Endpoint, baseUrl: string, paramValues: Record<string, string>): string {
  const resolvedPath = resolvePath(endpoint.path, paramValues)
  const effectiveBase = endpoint.baseUrlOverride ?? baseUrl
  const url = `${effectiveBase}${resolvedPath}`
  const queryString = buildQueryString(endpoint, paramValues)
  const fullUrl = queryString ? `${url}?${queryString}` : url
  const parts: string[] = ['curl']

  if (endpoint.method !== 'GET') {
    parts.push(`-X ${endpoint.method}`)
  }

  parts.push(`"${fullUrl}"`)

  if (endpoint.contentType === 'multipart/form-data') {
    parts.push(`-F "file=@motivation-letter.pdf"`)
  } else if (endpoint.requestBody && endpoint.method !== 'GET') {
    parts.push(`-H "Content-Type: application/json"`)
    parts.push(`-d '${endpoint.requestBody}'`)
  }

  return parts.join(' \\\n  ')
}

function generateJavaScript(endpoint: Endpoint, baseUrl: string, paramValues: Record<string, string>): string {
  const resolvedPath = resolvePath(endpoint.path, paramValues)
  const effectiveBase = endpoint.baseUrlOverride ?? baseUrl
  const url = `${effectiveBase}${resolvedPath}`
  const queryString = buildQueryString(endpoint, paramValues)
  const fullUrl = queryString ? `${url}?${queryString}` : url

  if (endpoint.contentType === 'multipart/form-data') {
    return `const formData = new FormData()
formData.append("file", fileInput.files[0])

const response = await fetch("${fullUrl}", {
  method: "POST",
  body: formData,
})
const data = await response.json()
console.log(data)`
  }

  if (endpoint.requestBody && endpoint.method !== 'GET') {
    return `const response = await fetch("${fullUrl}", {
  method: "${endpoint.method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${endpoint.requestBody}),
})
const data = await response.json()
console.log(data)`
  }

  return `const response = await fetch("${fullUrl}")
const data = await response.json()
console.log(data)`
}

function resolvePath(path: string, paramValues: Record<string, string>): string {
  return path.replace(/\{(\w+)\}/g, (_, key) => paramValues[key] || `{${key}}`)
}

function buildQueryString(endpoint: Endpoint, paramValues: Record<string, string>): string {
  if (endpoint.queryParams.length === 0) return ''
  const params = new URLSearchParams()
  for (const q of endpoint.queryParams) {
    const val = paramValues[q.name] || (q.default !== undefined ? String(q.default) : '')
    if (val) params.set(q.name, val)
  }
  return params.toString()
}

const codeGenerators: Record<CodeLanguage, typeof generatePython> = {
  python: generatePython,
  curl: generateCurl,
  javascript: generateJavaScript,
}

// ─── Component ───
interface EndpointCardProps {
  endpoint: Endpoint
  baseUrl: string
  language: CodeLanguage
  onLanguageChange: (lang: CodeLanguage) => void
}

export function EndpointCard({ endpoint, baseUrl, language, onLanguageChange }: EndpointCardProps) {
  const [showBody, setShowBody] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [showTryIt, setShowTryIt] = useState(false)
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const p of endpoint.pathParams) {
      initial[p.name] = ''
    }
    for (const q of endpoint.queryParams) {
      initial[q.name] = q.default !== undefined ? String(q.default) : ''
    }
    return initial
  })
  const [tryItBody, setTryItBody] = useState(endpoint.requestBody ?? '')
  const [tryItResponse, setTryItResponse] = useState<{ status: number; body: string } | null>(null)
  const [isSending, setIsSending] = useState(false)

  const updateParam = useCallback((name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSendRequest = useCallback(async () => {
    setIsSending(true)
    setTryItResponse(null)

    try {
      const resolvedPath = resolvePath(endpoint.path, paramValues)
      const queryString = buildQueryString(endpoint, paramValues)
      const effectiveTryItBase = endpoint.baseUrlOverride ?? baseUrl
      const url = `${effectiveTryItBase}${resolvedPath}${queryString ? `?${queryString}` : ''}`

      const options: RequestInit = {
        method: endpoint.method,
        headers: {} as Record<string, string>,
      }

      if (endpoint.requestBody && endpoint.method !== 'GET' && endpoint.contentType !== 'multipart/form-data') {
        ;(options.headers as Record<string, string>)['Content-Type'] = 'application/json'
        options.body = tryItBody
      }

      const response = await fetch(url, options)
      let body: string
      try {
        const json = await response.json()
        body = JSON.stringify(json, null, 2)
      } catch {
        body = await response.text()
      }

      setTryItResponse({ status: response.status, body })
    } catch (error) {
      setTryItResponse({
        status: 0,
        body: `Error: ${error instanceof Error ? error.message : 'Failed to send request'}`,
      })
    } finally {
      setIsSending(false)
    }
  }, [endpoint, baseUrl, paramValues, tryItBody])

  const codeSnippet = codeGenerators[language](endpoint, baseUrl, paramValues)
  const allParams = [...endpoint.pathParams, ...endpoint.queryParams]

  return (
    <div
      id={endpoint.id}
      className="scroll-mt-20 rounded-xl border border-border dark:border-white/8 bg-card dark:bg-white/[0.02] overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border dark:border-white/8">
        <span
          className={cn(
            'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide',
            methodColors[endpoint.method],
          )}
        >
          {endpoint.method}
        </span>
        <code className="font-mono text-sm font-medium text-foreground">{endpoint.path}</code>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{endpoint.description}</p>

        {/* Parameters */}
        {allParams.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parameters
            </h4>
            <div className="rounded-lg border border-border dark:border-white/8 divide-y divide-border dark:divide-white/8">
              {allParams.map((param) => (
                <div key={param.name} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <code className="font-mono text-xs font-medium text-foreground">{param.name}</code>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {param.type}
                  </Badge>
                  {param.required && (
                    <Badge variant="destructive" className="text-[10px] h-4">
                      required
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-xs flex-1">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request body (collapsible) */}
        {endpoint.requestBody && (
          <div>
            <button
              type="button"
              onClick={() => setShowBody(!showBody)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {showBody ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              Request Body
            </button>
            {showBody && (
              <div className="mt-2">
                <CodeBlock code={endpoint.requestBody} language="json" />
              </div>
            )}
          </div>
        )}

        {/* Response example (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowResponse(!showResponse)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {showResponse ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            Response Example
          </button>
          {showResponse && (
            <div className="mt-2">
              <CodeBlock code={endpoint.responseExample} language="json" />
            </div>
          )}
        </div>

        {/* Code snippets with language tabs */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Code Examples
          </h4>
          <Tabs value={language} onValueChange={(v) => onLanguageChange(v as CodeLanguage)}>
            <TabsList className="mb-2">
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="python">
              <CodeBlock code={codeSnippet} language="python" />
            </TabsContent>
            <TabsContent value="curl">
              <CodeBlock code={codeSnippet} language="bash" />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeBlock code={codeSnippet} language="javascript" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Try It section */}
        <div className="border-t border-border dark:border-white/8 pt-4">
          <button
            type="button"
            onClick={() => setShowTryIt(!showTryIt)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Play className="size-4" />
            Try it
            {showTryIt ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>

          {showTryIt && (
            <div className="mt-3 space-y-3">
              {/* Path + query param inputs */}
              {allParams.length > 0 && (
                <div className="space-y-2">
                  {allParams.map((param) => (
                    <div key={param.name} className="flex items-center gap-2">
                      <label className="w-40 shrink-0 text-xs font-mono text-muted-foreground">
                        {param.name}
                      </label>
                      <Input
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) => updateParam(param.name, e.target.value)}
                        placeholder={`Enter ${param.name}`}
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Editable request body */}
              {endpoint.requestBody && endpoint.contentType !== 'multipart/form-data' && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Request Body
                  </label>
                  <textarea
                    value={tryItBody}
                    onChange={(e) => setTryItBody(e.target.value)}
                    rows={Math.min(tryItBody.split('\n').length + 1, 20)}
                    className="w-full rounded-lg border border-border dark:border-white/8 bg-zinc-950 dark:bg-black p-3 font-mono text-[13px] text-zinc-300 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    spellCheck={false}
                  />
                </div>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleSendRequest}
                disabled={isSending}
                className="gap-1.5"
              >
                {isSending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    Send Request
                  </>
                )}
              </Button>

              {/* Response display */}
              {tryItResponse && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                    <Badge
                      variant={tryItResponse.status >= 200 && tryItResponse.status < 300 ? 'default' : 'destructive'}
                      className="text-[10px] h-4"
                    >
                      {tryItResponse.status === 0 ? 'Error' : tryItResponse.status}
                    </Badge>
                  </div>
                  <CodeBlock code={tryItResponse.body} language="json" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
