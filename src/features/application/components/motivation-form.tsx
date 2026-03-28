'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useApplicationFormStore } from '../hooks/use-application-form'
import {
  MOTIVATION_FILE_ACCEPT,
  MOTIVATION_ALLOWED_EXTENSIONS,
  MOTIVATION_ALLOWED_MIME_TYPES,
  MOTIVATION_QUESTIONS,
} from '../constants'
import type { SerializedMotivationLetter } from '../types'
import { Upload, FileText, Trash2 } from 'lucide-react'

const MAX_MOTIVATION_FILE_SIZE_MB = 5
const MAX_MOTIVATION_FILE_SIZE_BYTES = MAX_MOTIVATION_FILE_SIZE_MB * 1024 * 1024

export function MotivationForm() {
  const {
    data: { motivation },
    setMotivation,
  } = useApplicationFormStore()

  const [fileError, setFileError] = useState<string>('')

  const selectedFile = motivation.motivationLetter

  const prettyFileSize = useMemo(() => {
    if (!selectedFile) {
      return ''
    }

    const sizeInMb = selectedFile.size / (1024 * 1024)
    return `${sizeInMb.toFixed(2)} MB`
  }, [selectedFile])

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const dataUrl = String(reader.result ?? '')
        const base64 = dataUrl.split(',')[1]
        if (!base64) {
          reject(new Error('Unable to read file as base64'))
          return
        }

        resolve(base64)
      }

      reader.onerror = () => {
        reject(new Error('Unable to read file'))
      }

      reader.readAsDataURL(file)
    })
  }, [])

  const hasAllowedExtension = useCallback((fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (!extension) {
      return false
    }

    return MOTIVATION_ALLOWED_EXTENSIONS.includes(
      extension as (typeof MOTIVATION_ALLOWED_EXTENSIONS)[number],
    )
  }, [])

  const hasAllowedMime = useCallback((mimeType: string): boolean => {
    if (!mimeType) {
      return false
    }

    return MOTIVATION_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof MOTIVATION_ALLOWED_MIME_TYPES)[number],
    )
  }, [])

  const handleLetterUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!file) {
        return
      }

      const validByMime = hasAllowedMime(file.type)
      const validByExtension = hasAllowedExtension(file.name)
      if (!validByMime && !validByExtension) {
        setFileError('Only DOC, DOCX, PDF, and TXT files are allowed')
        return
      }

      if (file.size > MAX_MOTIVATION_FILE_SIZE_BYTES) {
        setFileError(`File must be up to ${MAX_MOTIVATION_FILE_SIZE_MB} MB`)
        return
      }

      try {
        const base64 = await fileToBase64(file)

        const serializableLetter: SerializedMotivationLetter = {
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64,
          size: file.size,
          lastModified: file.lastModified,
        }

        setMotivation({
          motivationLetter: serializableLetter,
        })
        setFileError('')
      } catch {
        setFileError('Unable to read selected file. Try again.')
      }
    },
    [fileToBase64, hasAllowedExtension, hasAllowedMime, setMotivation],
  )

  const handleRemoveLetter = useCallback(() => {
    setMotivation({ motivationLetter: null })
    setFileError('')
  }, [setMotivation])

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setMotivation({
        motivationQuestions: {
          ...motivation.motivationQuestions,
          [questionId]: value,
        },
      })
    },
    [motivation.motivationQuestions, setMotivation],
  )

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 text-base font-semibold">Motivation Letter</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Upload your motivation letter. Allowed formats: DOC, DOCX, PDF, TXT.
        </p>

        <div className="space-y-3">
          <Label className="sr-only" htmlFor="motivation-letter-upload">
            Upload motivation letter
          </Label>
          <input
            id="motivation-letter-upload"
            type="file"
            accept={MOTIVATION_FILE_ACCEPT}
            onChange={handleLetterUpload}
            className="sr-only"
          />

          {!selectedFile && (
            <label
              htmlFor="motivation-letter-upload"
              className={cn(
                'border-border hover:border-primary/50 hover:bg-accent-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm transition-colors',
              )}
            >
              <Upload className="size-4" />
              Upload motivation letter
            </label>
          )}

          {selectedFile && (
            <div className="border-border bg-accent-1 flex items-center justify-between gap-3 rounded-xl border px-3 py-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">{selectedFile.fileName}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedFile.mimeType} | {prettyFileSize}
                </p>
              </div>

              <Button type="button" variant="ghost" size="icon-sm" onClick={handleRemoveLetter}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}

          {fileError && <p className="text-destructive text-sm">{fileError}</p>}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-2 text-base font-semibold">Motivation Questions</h3>
        <p className="text-muted-foreground mb-4 text-sm">Answer in as much detail as possible.</p>

        <div className="space-y-6">
          {MOTIVATION_QUESTIONS.map((question, index) => (
            <FormField key={question.id} label={`${index + 1}. ${question.prompt}`} required>
              <textarea
                className={cn(
                  'border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none',
                  'focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                )}
                placeholder="Write your answer here..."
                value={motivation.motivationQuestions[question.id] ?? ''}
                onChange={(event) => handleAnswerChange(question.id, event.target.value)}
              />
            </FormField>
          ))}
        </div>
      </section>
    </div>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="leading-6">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}
