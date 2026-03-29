'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
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

  const canSend = useMemo(() => message.trim().length > 0 && !isLoading, [message, isLoading])

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
        className="border-border bg-background flex-1 space-y-3 overflow-y-auto rounded-xl border p-3 sm:p-4"
      >
        {history.map((entry, index) => {
          const isAgent = entry.sender === 'Agent'

          return (
            <div
              key={`${entry.sender}-${entry.question_id}-${index}`}
              className={cn('flex', isAgent ? 'justify-start' : 'justify-end')}
            >
              <div
                className={cn(
                  'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%]',
                  isAgent
                    ? 'bg-secondary text-foreground rounded-bl-md'
                    : 'bg-primary text-primary-foreground rounded-br-md',
                )}
              >
                <p className="mb-1 text-xs font-semibold tracking-wide opacity-70">
                  {isAgent ? 'Agent' : 'User'}
                </p>
                <p className="wrap-break-word whitespace-pre-wrap">{entry.text}</p>
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <p className="mb-1 text-xs font-semibold tracking-wide opacity-70">Agent</p>
              <p className="animate-pulse">Typing...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="border-destructive/25 bg-destructive/10 mt-4 rounded-xl border px-4 py-3">
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 sm:gap-3">
        <Input
          value={message}
          disabled={isLoading}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your answer..."
          className="h-11"
        />

        <Button type="submit" disabled={!canSend} className="h-11 min-w-24 rounded-xl">
          Send
        </Button>
      </form>
    </section>
  )
}
