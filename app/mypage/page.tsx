// app/mypage/page.tsx

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
    if (typeof window === 'undefined') return

    try {
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
    } catch (e) {
      console.error('Failed to load user info', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // ⏳ 확인 중
  if (loading) {
    return (
      <main className="page">
        <section className="section">
          <header className="section-header">
            <h1 className="section-title">마이페이지</h1>
            <p className="section-description">
              내 계정 정보를 불러오는 중입니다.
            </p>
          </header>

          <div className="card card-surface">
            <div className="card-body">
              <p className="muted-text">마이페이지를 불러오는 중...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // 🔒 로그인 필요 상태
  if (!user) {
    return (
      <main className="page">
        <section className="section">
          <header className="section-header">
            <h1 className="section-title">마이페이지</h1>
            <p className="section-description">
              내 활동과 계정 정보를 확인하려면 먼저 로그인해야 합니다.
            </p>
          </header>

          <div className="card card-surface">
            <div className="card-body">
              <p className="muted-text" style={{ marginBottom: 12 }}>
                아직 로그인하지 않은 상태입니다.
              </p>

              <div className="form-actions">
                <Link href="/login" className="btn btn-primary">
                  로그인 하러 가기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // ✅ 로그인된 상태
  return (
    <main className="page">
      <section className="section">
        <header className="section-header">
          <h1 className="section-title">마이페이지</h1>
          <p className="section-description">
            현재 로그인 중인 계정 정보를 확인할 수 있습니다.
          </p>
        </header>

        <div className="card card-surface">
          <div className="card-body">
            {/* 상단 프로필 영역 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div className="avatar-circle">
                {(user.name || user.email)[0]?.toUpperCase()}
              </div>
              <div>
                <p className="nickname-text">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="meta-text">내 독서 리뷰 계정</p>
              </div>
            </div>

            {/* 기본 정보 */}
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <p>
                <span className="meta-muted">이메일</span>
                <br />
                {user.email}
              </p>

              {user.name && (
                <p style={{ marginTop: 8 }}>
                  <span className="meta-muted">닉네임</span>
                  <br />
                  {user.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
