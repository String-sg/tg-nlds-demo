import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { QueryProvider } from '@/providers/query-provider'
import { FontSizeProvider } from '@/contexts/font-size-context'
import { AccessibilityProvider } from '@/contexts/accessibility-context'
import { AssistantProvider } from '@/contexts/assistant-context'
import { UserProvider } from '@/contexts/user-context'
import { InboxProvider } from '@/contexts/inbox-context'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'moe-tg-vx',
  description: 'Modern Next.js starter with shadcn/ui',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('app-font-size');
                  if (stored) {
                    var size = parseInt(stored, 10);
                    if (!isNaN(size) && size >= 14 && size <= 20) {
                      document.documentElement.style.setProperty('--font-size-base', size + 'px');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontSizeProvider>
          <AccessibilityProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <QueryProvider>
                <UserProvider>
                  <InboxProvider>
                    <AssistantProvider>
                      <SidebarProvider>{children}</SidebarProvider>
                    </AssistantProvider>
                  </InboxProvider>
                </UserProvider>
              </QueryProvider>
            </ThemeProvider>
          </AccessibilityProvider>
        </FontSizeProvider>
      </body>
    </html>
  )
}
