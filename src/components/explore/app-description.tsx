interface AppDescriptionProps {
  fullDescription: string
  features?: string[]
  platforms?: string[]
}

export function AppDescription({
  fullDescription,
  features,
  platforms,
}: AppDescriptionProps) {
  return (
    <div className="border-b border-stone-200 px-6 py-8">
      <div className="space-y-6">
        {/* Description */}
        <div className="space-y-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">
            {fullDescription}
          </p>
        </div>

        {/* Features */}
        {features && features.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-stone-900">Key Features</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-stone-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Platforms */}
        {platforms && platforms.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <span className="font-medium">Available on:</span>
            <div className="flex items-center gap-1">
              {platforms.map((platform, index) => (
                <span key={platform}>
                  {platform}
                  {index < platforms.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
