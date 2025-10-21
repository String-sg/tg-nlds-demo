'use client'

import { useFontSize } from '@/contexts/font-size-context'
import { useAccessibility } from '@/contexts/accessibility-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Type, Contrast } from 'lucide-react'

const FONT_SIZE_OPTIONS = [
  { value: 14, label: 'Small' },
  { value: 16, label: 'Medium' },
  { value: 18, label: 'Large (Default)' },
  { value: 20, label: 'Extra Large' },
]

export function SettingsContent() {
  const { fontSize, setFontSize } = useFontSize()
  const accessibility = useAccessibility()

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                Customize the app to better suit your needs
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={accessibility.resetToDefaults}
            >
              Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size Control */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Type className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-size-slider" className="text-base font-medium">
                    Font Size
                  </Label>
                  <span className="text-muted-foreground text-sm">
                    {getCurrentLabel()}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Adjust text size throughout the app
                </p>
              </div>
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
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
              <span>XL</span>
            </div>
          </div>

          <div className="border-t" />

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Contrast className="size-5" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="high-contrast" className="text-base font-medium">
                  High Contrast Mode
                </Label>
                <p className="text-muted-foreground text-sm">
                  Increase contrast for better visibility
                </p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={accessibility.highContrast}
              onCheckedChange={accessibility.setHighContrast}
            />
          </div>

          <div className="border-t" />

          {/* Live Preview */}
          <div className="border-border bg-muted/30 rounded-lg border p-6">
            <p className="text-muted-foreground mb-4 text-sm font-medium">
              Preview
            </p>
            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
              The quick brown fox jumps over the lazy dog. This is how text will
              appear throughout the app with your selected font size.
            </p>
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
