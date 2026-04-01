'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage } from '../types'

interface InternalTestChatProps {
  history: ChatMessage[]
  isLoading: boolean
  error: string | null
  onSend: (text: string) => Promise<void>
}

export function InternalTestChat({ history, isLoading, error, onSend }: InternalTestChatProps) {
  const [message, setMessage] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [history])

  const MIN_CHARS = 100
  const trimmedLength = message.trim().length
  const isTooShort = trimmedLength > 0 && trimmedLength < MIN_CHARS
  const canSend = trimmedLength >= MIN_CHARS && !isLoading

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) {
      return
    }

    setMessage('')
    await onSend(trimmedMessage)
  }

  return (
    <section className="flex h-[70vh] min-h-130 flex-col p-4 sm:p-6">
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card dark:bg-white/5 p-4 shadow-sm sm:p-5"
      >
        {history.map((entry, index) => {
          const isAgent = entry.sender === 'agent'

          return (
            <div
              key={`${entry.sender}-${index}`}
              className={cn('flex', isAgent ? 'justify-start' : 'justify-end')}
            >
              <div
                className={cn(
                  'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%]',
                  isAgent
                    ? 'rounded-bl-md bg-muted dark:bg-white/10 text-foreground'
                    : 'bg-primary text-primary-foreground rounded-br-md',
                )}
              >
                <p className="mb-1 text-xs font-semibold tracking-wide opacity-60">
                  {isAgent ? 'Agent' : 'You'}
                </p>
                <p className="wrap-break-word whitespace-pre-wrap">{entry.text}</p>
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-muted dark:bg-white/10 px-4 py-3 text-sm text-foreground">
              <p className="mb-1 text-xs font-semibold tracking-wide opacity-60">Agent</p>
              <p className="animate-pulse">Typing...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3">
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <div className="flex gap-3">
          <Input
            value={message}
            disabled={isLoading}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your answer..."
            className="h-12"
          />

          <Button type="submit" disabled={!canSend} className="h-12 min-w-24 rounded-xl">
            Send
          </Button>
        </div>

        <div className="flex items-center justify-between px-1">
          {isTooShort ? (
            <p className="text-xs text-amber-500">
              Please provide a detailed answer — at least {MIN_CHARS} characters ({MIN_CHARS - trimmedLength} more)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50">
              Minimum {MIN_CHARS} characters — answer as broadly and honestly as possible
            </p>
          )}
          <span className={cn('text-xs tabular-nums', isTooShort ? 'text-amber-500' : 'text-muted-foreground/50')}>
            {trimmedLength}/{MIN_CHARS}
          </span>
        </div>
      </form>
    </section>
  )
}
