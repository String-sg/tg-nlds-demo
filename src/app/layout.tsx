import type { Metadata } from 'next'
// Temporarily disabled Google Fonts due to network restrictions in build environment
// import { Geist, Geist_Mono } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'
import { FontSizeProvider } from '@/contexts/font-size-context'
import { AccessibilityProvider } from '@/contexts/accessibility-context'
import { AssistantProvider } from '@/contexts/assistant-context'
import { UserProvider } from '@/contexts/user-context'
import { UserRoleProvider } from '@/contexts/user-role-context'
import { InboxProvider } from '@/contexts/inbox-context'
import './globals.css'

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

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
        className="antialiased"
      >
        <FontSizeProvider>
          <AccessibilityProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {/* Demo Banner - Absolute top of the app */}
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 w-full">
                <p className="text-sm text-blue-800 text-center">
                  This is a demo and may not 100% mirror the actual implementation of Teachers Workspace
                </p>
              </div>

              <QueryProvider>
                <UserProvider>
                  <UserRoleProvider>
                    <InboxProvider>
                      <AssistantProvider>
                        <SidebarProvider>{children}</SidebarProvider>
                      </AssistantProvider>
                    </InboxProvider>
                  </UserRoleProvider>
                </UserProvider>
              </QueryProvider>
              <Toaster />
            </ThemeProvider>
          </AccessibilityProvider>
        </FontSizeProvider>
      </body>
    </html>
  )
}
