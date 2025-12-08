// app/layout.tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import SiteHeader from '@/components/layout/SiteHeader'

export const metadata: Metadata = {
  title: '보안형 독서 리뷰 플랫폼',
  description: '독서 리뷰, 토론, 투표까지 가능한 보안형 독서 커뮤니티 플랫폼',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className="app-root">
        <SiteHeader />
        <main className="app-main">
          <div className="app-container">{children}</div>
        </main>
      </body>
    </html>
  )
}