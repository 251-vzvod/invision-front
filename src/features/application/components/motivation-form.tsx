'use client'

import { useCallback, useMemo, useState } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { useDeleteMotivationLetterMutation, useUploadMotivationLetterMutation } from '../api'
import { useApplicationFormStore } from '../hooks/use-application-form'
import {
  MOTIVATION_FILE_ACCEPT,
  MOTIVATION_ALLOWED_EXTENSIONS,
  MOTIVATION_ALLOWED_MIME_TYPES,
} from '../constants'
import { Upload, FileText, Trash2 } from 'lucide-react'

const MAX_MOTIVATION_FILE_SIZE_MB = 5
const MAX_MOTIVATION_FILE_SIZE_BYTES = MAX_MOTIVATION_FILE_SIZE_MB * 1024 * 1024

export function MotivationForm() {
  const {
    data: { motivation },
    setMotivation,
  } = useApplicationFormStore()

  const uploadMutation = useUploadMotivationLetterMutation()
  const deleteMutation = useDeleteMotivationLetterMutation()
  const [fileError, setFileError] = useState<string>('')

  const selectedFile = motivation.motivationLetter

  const prettyFileSize = useMemo(() => {
    if (!selectedFile) {
      return ''
    }

    const sizeInMb = selectedFile.size / (1024 * 1024)
    return `${sizeInMb.toFixed(2)} MB`
  }, [selectedFile])

  const isBusy = uploadMutation.isPending || deleteMutation.isPending

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

  const removeUploadedLetter = useCallback(async (): Promise<boolean> => {
    const currentFileUrl = motivation.motivationLetter?.fileUrl
    if (!currentFileUrl) {
      setMotivation({ motivationLetter: null })
      return true
    }

    try {
      await deleteMutation.mutateAsync(currentFileUrl)
      setMotivation({ motivationLetter: null })
      return true
    } catch {
      setFileError('Unable to delete uploaded file. Please try again.')
      return false
    }
  }, [deleteMutation, motivation.motivationLetter?.fileUrl, setMotivation])

  const handleLetterUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!file || isBusy) {
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

      if (motivation.motivationLetter?.fileUrl) {
        const removed = await removeUploadedLetter()
        if (!removed) {
          return
        }
      }

      try {
        const response = await uploadMutation.mutateAsync(file)
        setMotivation({
          motivationLetter: {
            fileUrl: response.url,
            fileName: response.filename || file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
          },
        })
        setFileError('')
      } catch {
        setFileError('Unable to upload selected file. Try again.')
      }
    },
    [
      hasAllowedExtension,
      hasAllowedMime,
      isBusy,
      motivation.motivationLetter?.fileUrl,
      removeUploadedLetter,
      setMotivation,
      uploadMutation,
    ],
  )

  const handleRemoveLetter = useCallback(async () => {
    if (isBusy) {
      return
    }

    const removed = await removeUploadedLetter()
    if (removed) {
      setFileError('')
    }
  }, [isBusy, removeUploadedLetter])

  const handlePresentationLinkChange = useCallback(
    (value: string) => {
      setMotivation({ presentationLink: value.trim() })
    },
    [setMotivation],
  )

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 text-base font-semibold">Presentation</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Add a YouTube link to your presentation.
        </p>

        <FormField label="Presentation link" required>
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={motivation.presentationLink}
            onChange={(event) => handlePresentationLinkChange(event.target.value)}
          />
        </FormField>
      </section>

      <Separator />

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
            disabled={isBusy}
            className="sr-only"
          />

          {!selectedFile && (
            <label
              htmlFor="motivation-letter-upload"
              className={cn(
                'bg-card/70 border-border hover:border-primary/40 hover:bg-primary/5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all dark:border-white/15 dark:bg-white/[0.03]',
                isBusy && 'pointer-events-none opacity-60',
              )}
            >
              <Upload className="text-muted-foreground size-8" />
              <span className="text-sm font-medium">
                {uploadMutation.isPending
                  ? 'Uploading file...'
                  : 'Click or drag to upload motivation letter'}
              </span>
              <span className="text-muted-foreground text-xs">DOC, DOCX, PDF, TXT up to 5 MB</span>
            </label>
          )}

          {selectedFile && (
            <div className="border-border bg-card flex items-center justify-between gap-3 rounded-xl border p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-muted/80 flex size-10 shrink-0 items-center justify-center rounded-lg dark:bg-white/[0.06]">
                  <FileText className="text-muted-foreground size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{selectedFile.fileName}</p>
                  <p className="text-muted-foreground text-xs">
                    {selectedFile.mimeType} | {prettyFileSize}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemoveLetter}
                disabled={isBusy}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}

          {fileError && <p className="text-destructive text-sm">{fileError}</p>}
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
