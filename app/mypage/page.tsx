'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type UserInfo = {
  email: string
  name: string
}

export default function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const email = localStorage.getItem('userEmail')
        const name = localStorage.getItem('userName')

        if (email) {
          setUser({
            email,
            name: name || '',
          })
        } else {
          setUser(null)
        }
      }
    } catch (e) {
      console.error('Failed to load user info from localStorage', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <main className="page flex items-center justify-center">
        <p className="muted-text">마이페이지를 불러오는 중입니다...</p>
      </main>
    )
  }

  return (
    <main className="page">
      {/* 상단 헤더 */}
      <header className="section-header section-header-with-back">
        <div>
          <p className="breadcrumb">
            <Link href="/" className="breadcrumb-link">
              홈
            </Link>{' '}
            <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">마이페이지</span>
          </p>
          <h1 className="section-title">마이페이지</h1>
          <p className="section-description">
            로그인 정보와 앞으로 추가될 리뷰·커뮤니티 활동을 한 곳에서 관리하는
            공간입니다.
          </p>
        </div>

        <div className="header-actions">
          <Link href="/books" className="btn btn-sm btn-ghost">
            도서 보러가기
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <section className="section">
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* 유저 정보 카드 */}
          <article className="card card-surface">
            <div className="card-body space-y-4">
              <h2 className="card-title">내 정보</h2>

              {user ? (
                <div className="space-y-3">
                  <div>
                    <p className="meta-text meta-muted mb-1">이메일</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  {user.name && (
                    <div>
                      <p className="meta-text meta-muted mb-1">이름 / 닉네임</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  )}

                  <p className="text-sm text-slate-400">
                    로그인 시 입력한 정보를 기반으로 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium">로그인된 사용자가 없습니다.</p>
                  <p className="text-sm text-slate-400">
                    향후 로그인 기능이 추가되면, 이곳에서 내 정보를 확인하고
                    수정할 수 있습니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled
                    >
                      로그인 (준비 중)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
