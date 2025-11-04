'use client'

import { useState } from 'react'
import { Loader2Icon, ImageIcon, AlertCircleIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { generateStudentImagesBatch } from '@/app/actions/openai-image-actions'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BatchGenerateDialogProps {
  studentIds: string[]
  classNameDisplay: string
}

interface GenerationResult {
  studentId: string
  studentName: string
  status: 'pending' | 'generating' | 'success' | 'error'
  imageUrl?: string
  error?: string
}

/**
 * Dialog component for batch generating AI portraits for all students
 *
 * Features:
 * - Batch generation with progress tracking
 * - Real-time status updates
 * - Handles rate limiting and errors gracefully
 * - Shows detailed results for each student
 */
export function BatchGenerateDialog({
  studentIds,
  classNameDisplay,
}: BatchGenerateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<GenerationResult[]>([])
  const [progress, setProgress] = useState(0)

  const handleBatchGenerate = async () => {
    setIsGenerating(true)
    setResults([])
    setProgress(0)

    try {
      // Initialize results
      const initialResults: GenerationResult[] = studentIds.map(id => ({
        studentId: id,
        studentName: 'Loading...',
        status: 'pending',
      }))
      setResults(initialResults)

      // Call batch generation
      const batchResults = await generateStudentImagesBatch(studentIds)

      // Update results with actual data
      const updatedResults: GenerationResult[] = batchResults.map((result, index) => {
        const studentName = result.message?.split(':')[0] || `Student ${index + 1}`

        return {
          studentId: studentIds[index],
          studentName,
          status: result.success ? 'success' : 'error',
          imageUrl: result.imageUrl,
          error: result.error,
        }
      })

      setResults(updatedResults)
      setProgress(100)

      const successCount = updatedResults.filter(r => r.status === 'success').length
      const errorCount = updatedResults.filter(r => r.status === 'error').length

      if (successCount > 0) {
        toast.success(`Generated ${successCount} photos successfully!`, {
          description: errorCount > 0 ? `${errorCount} failed` : undefined,
        })
      }

      if (errorCount === updatedResults.length) {
        toast.error('All generations failed', {
          description: 'Please check the error messages below',
        })
      }

    } catch (error) {
      console.error('Batch generation error:', error)
      toast.error('Batch generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (isGenerating) {
      if (confirm('Generation in progress. Are you sure you want to close?')) {
        setIsOpen(false)
      }
    } else {
      setIsOpen(false)
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const totalCount = studentIds.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <ImageIcon className="mr-2 size-4" />
          Generate All Student Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch Generate Student Photos</DialogTitle>
          <DialogDescription>
            Generate AI portraits for all {totalCount} students in {classNameDisplay}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Progress Section */}
          {isGenerating && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Generation Progress</span>
                <span className="text-muted-foreground">
                  {successCount + errorCount} / {totalCount}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                This may take several minutes. Please keep this window open.
              </p>
            </div>
          )}

          {/* Warning Message */}
          {!isGenerating && results.length === 0 && (
            <Alert>
              <AlertCircleIcon className="size-4" />
              <AlertDescription>
                <p className="font-medium">Before you start:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1 text-sm">
                  <li>This will generate photos for all {totalCount} students</li>
                  <li>Generation takes ~2 seconds per student (~{Math.ceil(totalCount * 2 / 60)} minutes total)</li>
                  <li>Cost: ${(totalCount * 0.04).toFixed(2)} USD (DALL-E 3 pricing)</li>
                  <li>Rate limited to 5 images per minute</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Generation Results</h4>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2Icon className="size-3" />
                    {successCount} success
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircleIcon className="size-3" />
                    {errorCount} failed
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[300px] rounded-md border">
                <div className="space-y-2 p-4">
                  {results.map((result) => (
                    <div
                      key={result.studentId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle2Icon className="size-5 shrink-0 text-green-600" />
                        ) : result.status === 'error' ? (
                          <XCircleIcon className="size-5 shrink-0 text-red-600" />
                        ) : result.status === 'generating' ? (
                          <Loader2Icon className="size-5 shrink-0 animate-spin text-blue-600" />
                        ) : (
                          <div className="size-5 shrink-0 rounded-full border-2 border-muted" />
                        )}

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{result.studentName}</span>
                          {result.error && (
                            <span className="text-xs text-red-600">{result.error}</span>
                          )}
                        </div>
                      </div>

                      {result.imageUrl && (
                        <img
                          src={result.imageUrl}
                          alt={`Generated photo of ${result.studentName}`}
                          className="size-12 rounded-md border object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            {isGenerating ? 'Cancel' : 'Close'}
          </Button>
          <Button
            onClick={handleBatchGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : results.length > 0 ? (
              'Regenerate All'
            ) : (
              `Generate ${totalCount} Photos`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
