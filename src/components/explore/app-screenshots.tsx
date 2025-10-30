import { Image } from 'lucide-react'

interface AppScreenshotsProps {
  screenshots?: string[]
  appName: string
}

export function AppScreenshots({ screenshots, appName }: AppScreenshotsProps) {
  // Placeholder screenshots if none provided
  const displayScreenshots = screenshots && screenshots.length > 0
    ? screenshots
    : []

  if (displayScreenshots.length === 0) {
    return (
      <div className="border-b border-stone-200 px-6 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-stone-200 bg-stone-50"
            >
              <div className="flex flex-col items-center gap-2 text-stone-400">
                <Image className="size-8" />
                <p className="text-sm">Screenshot {index}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-stone-200 px-6 py-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {displayScreenshots.map((screenshot, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-stone-200 shadow-sm"
          >
            <img
              src={screenshot}
              alt={`${appName} screenshot ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
