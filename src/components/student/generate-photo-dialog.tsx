'use client'

import { useState } from 'react'
import { Loader2Icon, ImageIcon, RefreshCwIcon, AlertCircleIcon, CheckCircle2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { generateStudentImage } from '@/app/actions/openai-image-actions'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface GeneratePhotoDialogProps {
  studentId: string
  studentName: string
  currentPhotoUrl?: string | null
  gender?: 'male' | 'female' | 'other'
  triggerVariant?: 'default' | 'outline' | 'ghost'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * Dialog component for generating AI student portraits using DALL-E 3
 *
 * Features:
 * - Single-click generation with DALL-E 3
 * - Preview of current and generated photos
 * - Regeneration capability
 * - Rate limit handling
 * - Error handling with user-friendly messages
 */
export function GeneratePhotoDialog({
  studentId,
  studentName,
  currentPhotoUrl,
  gender,
  triggerVariant = 'outline',
  triggerSize = 'sm',
}: GeneratePhotoDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateStudentImage({
        studentId,
        studentName,
        gender,
      })

      if (result.success && result.imageUrl) {
        setPreviewUrl(result.imageUrl)
        toast.success(result.message || 'Photo generated successfully!')
      } else {
        setError(result.error || 'Failed to generate photo')

        if (result.rateLimitExceeded) {
          toast.error('Rate limit exceeded', {
            description: result.error,
          })
        } else {
          toast.error('Generation failed', {
            description: result.error,
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Generation failed', {
        description: errorMessage,
      })
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset preview after dialog closes
    setTimeout(() => {
      setPreviewUrl(null)
      setError(null)
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          {currentPhotoUrl ? (
            <>
              <RefreshCwIcon className="mr-2 size-4" />
              Regenerate Photo
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 size-4" />
              Generate Photo
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Student Photo with AI</DialogTitle>
          <DialogDescription>
            Create a photorealistic portrait for {studentName} using DALL-E 3
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Preview Area */}
          <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-8">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2Icon className="size-12 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Generating portrait...</p>
                <p className="text-xs text-muted-foreground">This typically takes 5-10 seconds</p>
              </div>
            ) : previewUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={previewUrl}
                  alt={`Generated photo of ${studentName}`}
                  className="size-48 rounded-lg border-2 border-green-500 object-cover"
                />
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2Icon className="size-4" />
                  <span>Generated successfully!</span>
                </div>
              </div>
            ) : currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt={`Current photo of ${studentName}`}
                className="size-48 rounded-lg object-cover opacity-50"
              />
            ) : (
              <div className="flex size-48 items-center justify-center rounded-lg bg-muted">
                <ImageIcon className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          {!error && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-medium">ℹ️ What to expect:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1 text-xs">
                <li>Professional school portrait style</li>
                <li>White uniform background</li>
                <li>Appropriate for official records</li>
                <li>Generation takes 5-10 seconds</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            {previewUrl ? 'Done' : 'Cancel'}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : previewUrl ? (
              <>
                <RefreshCwIcon className="mr-2 size-4" />
                Regenerate
              </>
            ) : (
              'Generate Photo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
