'use client'

import { useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightSyntax(code: string): string {
  const tokenRegex =
    /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(#[^\n]*)|((?:^|\s)\/\/[^\n]*)|(\b(?:true|false|True|False|null|None)\b)|(\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b)|((?:^|\s)(?:-X|-H|-d|-F|--request|--header|--data|--data-raw|--form)\b)|(\b(?:import|from|as|def|return|class|const|let|var|function|async|await|fetch|print|requests|json|response)\b)|(\b\d+\.?\d*\b)/gm

  let lastIndex = 0
  let highlighted = ''

  for (const match of code.matchAll(tokenRegex)) {
    const matchText = match[0]
    const matchIndex = match.index ?? 0

    highlighted += escapeHtml(code.slice(lastIndex, matchIndex))

    if (match[7]) {
      const prefix = /^\s/.test(matchText) ? matchText[0] : ''
      const flag = prefix ? matchText.slice(1) : matchText
      highlighted += `${escapeHtml(prefix)}<span class="text-sky-400">${escapeHtml(flag)}</span>`
    } else if (match[4]) {
      const prefix = /^\s/.test(matchText) ? matchText[0] : ''
      const comment = prefix ? matchText.slice(1) : matchText
      highlighted += `${escapeHtml(prefix)}<span class="text-zinc-500">${escapeHtml(comment)}</span>`
    } else if (match[3]) {
      highlighted += `<span class="text-zinc-500">${escapeHtml(matchText)}</span>`
    } else if (match[1] || match[2]) {
      highlighted += `<span class="text-emerald-400">${escapeHtml(matchText)}</span>`
    } else if (match[9]) {
      highlighted += `<span class="text-amber-400">${escapeHtml(matchText)}</span>`
    } else if (match[5]) {
      highlighted += `<span class="text-purple-400">${escapeHtml(matchText)}</span>`
    } else if (match[8]) {
      highlighted += `<span class="text-sky-400">${escapeHtml(matchText)}</span>`
    } else if (match[6]) {
      highlighted += `<span class="text-yellow-400 font-semibold">${escapeHtml(matchText)}</span>`
    } else {
      highlighted += escapeHtml(matchText)
    }

    lastIndex = matchIndex + matchText.length
  }

  highlighted += escapeHtml(code.slice(lastIndex))

  return highlighted
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const highlighted = highlightSyntax(code)

  return (
    <div className={cn('group/code relative overflow-hidden rounded-lg', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900 px-4 py-2 dark:bg-zinc-950">
        {language && (
          <span className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            {language}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ml-auto text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </Button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto bg-zinc-950 p-4 dark:bg-black">
        <pre className="font-mono text-[13px] leading-relaxed text-zinc-300">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  )
}
