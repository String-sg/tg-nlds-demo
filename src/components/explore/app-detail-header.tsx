import { ArrowLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface AppDetailHeaderProps {
  onBack: () => void
}

export function AppDetailHeader({ onBack }: AppDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="size-4" />
        <span>Back</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => comingSoonToast.feature('Share')}
        className="gap-2 text-stone-600 hover:text-stone-900"
      >
        <Share2 className="size-4" />
        <span>Share</span>
      </Button>
    </div>
  )
}
