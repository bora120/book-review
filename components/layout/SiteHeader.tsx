// components/layout/SiteHeader.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: '홈', href: '/' },
  { label: '도서', href: '/books' },
  { label: '커뮤니티', href: '/community' },
  { label: '마이페이지', href: '/mypage' }, // ✅ 추가된 부분
]

export default function SiteHeader() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* 로고 */}
        <Link href="/" className="site-logo">
          <span className="site-logo-pill" />
          <span>보안형 독서 리뷰</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="site-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                'site-nav-link' +
                (isActive(item.href) ? ' site-nav-link-active' : '')
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 로그인 버튼 */}
        <div className="site-header-auth">
          <Link href="/login" className="site-login-button">
            로그인
          </Link>
        </div>
      </div>
    </header>
  )
}
