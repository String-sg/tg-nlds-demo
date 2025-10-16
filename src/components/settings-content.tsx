'use client'

import { useFontSize } from '@/contexts/font-size-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

const FONT_SIZE_OPTIONS = [
  { value: 14, label: 'Small' },
  { value: 16, label: 'Medium' },
  { value: 18, label: 'Large (Default)' },
  { value: 20, label: 'Extra Large' },
]

export function SettingsContent() {
  const { fontSize, setFontSize } = useFontSize()

  const handleFontSizeChange = (values: number[]) => {
    const newSize = values[0]
    if (newSize) {
      setFontSize(newSize)
    }
  }

  const getCurrentLabel = () => {
    const option = FONT_SIZE_OPTIONS.find((opt) => opt.value === fontSize)
    return option ? option.label : `${fontSize}px`
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your app preferences and accessibility options.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Customize the app to better suit your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size-slider" className="text-base font-medium">
                Font Size
              </Label>
              <span className="text-muted-foreground text-sm">
                {getCurrentLabel()}
              </span>
            </div>

            <Slider
              id="font-size-slider"
              min={14}
              max={20}
              step={2}
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (14px)</span>
              <span>Medium (16px)</span>
              <span>Large (18px)</span>
              <span>XL (20px)</span>
            </div>

            {/* Live Preview */}
            <div className="border-border bg-muted/30 mt-6 rounded-lg border p-6">
              <p className="text-muted-foreground mb-2 text-sm font-medium">
                Preview
              </p>
              <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
                The quick brown fox jumps over the lazy dog. This is how text will
                appear throughout the app with your selected font size.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future settings sections */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Coming soon...
          </p>
        </CardContent>
      </Card>

      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Manage your privacy and data preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
