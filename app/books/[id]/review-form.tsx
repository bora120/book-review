'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Review = {
  id: string
  bookId: string
  userEmail: string
  userName: string
  rating: number
  content: string
  createdAt: string
}

type ReviewFormProps = {
  bookId: string
}

export default function ReviewForm({ bookId }: ReviewFormProps) {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const [nickname, setNickname] = useState<string>('')
  const [rating, setRating] = useState<string>('5')
  const [content, setContent] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // 로그인 정보
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const email = localStorage.getItem('userEmail')
        const name = localStorage.getItem('userName')
        setUserEmail(email)
        setUserName(name)
        if (name) setNickname(name)
      }
    } catch (e) {
      console.error('Failed to read login info from localStorage', e)
    }
  }, [])

  // 리뷰 목록 불러오기
  const loadReviews = async () => {
    if (!bookId) return
    try {
      setLoadingReviews(true)
      const res = await fetch(
        `/api/reviews?bookId=${encodeURIComponent(bookId)}`
      )
      if (!res.ok) {
        console.error('리뷰 불러오기 실패', res.status)
        return
      }
      const data: Review[] = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('리뷰 불러오기 중 오류', e)
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  // 리뷰 등록
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!userEmail || !userName) {
      setError('리뷰 작성은 로그인 후에만 가능합니다.')
      return
    }

    if (!content.trim()) {
      setError('리뷰 내용을 입력해줘.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          rating: Number(rating),
          content,
          userEmail,
          userName: nickname || userName,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        const msg =
          (data && data.message) || '리뷰를 저장하는 중 오류가 발생했습니다.'
        setError(msg)
        return
      }

      setSuccess('리뷰가 등록되었어요.')
      setContent('')
      setRating('5')
      await loadReviews()
    } catch (err) {
      console.error(err)
      setError('리뷰 등록 중 알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <div className="review-section">
      {/* 1. 상단 요약 카드 */}
      <div className="card card-surface review-summary">
        <div className="card-body">
          <h2 className="card-title">이 책에 대한 리뷰</h2>
          <p className="muted-text">다른 독자들이 남긴 감상을 확인해봐.</p>

          <div
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⭐</span>
            {averageRating ? (
              <span style={{ fontWeight: 600 }}>
                {averageRating.toFixed(1)} / 5
              </span>
            ) : (
              <span className="muted-text">아직 별점이 없어요.</span>
            )}
          </div>

          <p style={{ marginTop: 4 }} className="muted-text">
            리뷰 {reviews.length}개
          </p>
        </div>
      </div>

      {/* 2. 리뷰 목록 박스 */}
      <div className="review-list-box">
        {loadingReviews && (
          <p className="review-list-empty">리뷰를 불러오는 중입니다...</p>
        )}

        {!loadingReviews && reviews.length === 0 && (
          <p className="review-list-empty">
            아직 등록된 리뷰가 없어요. 첫 리뷰의 주인공이 되어줘!
          </p>
        )}

        {!loadingReviews &&
          reviews.length > 0 &&
          reviews.map((r) => (
            <article key={r.id} className="review-item">
              <div className="review-item-header">
                <div>
                  <div className="review-item-nickname">{r.userName}</div>
                  <div className="review-item-date">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="review-item-rating">
                  {'★'.repeat(r.rating)}
                  <span
                    style={{
                      color: 'var(--color-text-soft)',
                      marginLeft: 4,
                    }}
                  >
                    ({r.rating}점)
                  </span>
                </div>
              </div>

              <p className="review-item-content">{r.content}</p>
            </article>
          ))}
      </div>

      {/* 3. 리뷰 작성 카드 — 여기만 공백 줄이기 대상 */}
      {!userEmail || !userName ? (
        <div className="card card-surface review-form-card">
          <div className="card-body">
            <h3 className="card-title">리뷰 작성</h3>
            <p className="muted-text">
              이 책을 읽었다면 한 줄이라도 괜찮아. 로그인을 하면 리뷰를 남길 수
              있어.
            </p>
            <div className="review-form-footer">
              <button
                className="btn btn-primary review-form-submit"
                onClick={() => router.push('/login')}
              >
                로그인 하러 가기
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="card card-surface review-form-card"
          onSubmit={handleSubmit}
        >
          <div className="card-body">
            <h3 className="card-title">리뷰 작성</h3>

            {/* 닉네임 / 별점 블록 */}
            <div className="review-form-row">
              <label className="form-label review-form-label">
                닉네임
                <input
                  name="nickname"
                  type="text"
                  placeholder="리뷰에 표시될 이름"
                  className="input review-form-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
                <span className="review-form-meta">
                  로그인한 계정: {userEmail}
                </span>
              </label>

              <label className="form-label review-form-label">
                별점
                <select
                  name="rating"
                  className="input review-form-input"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  required
                >
                  <option value="5">★★★★★ (5점)</option>
                  <option value="4">★★★★☆ (4점)</option>
                  <option value="3">★★★☆☆ (3점)</option>
                  <option value="2">★★☆☆☆ (2점)</option>
                  <option value="1">★☆☆☆☆ (1점)</option>
                </select>
              </label>
            </div>

            {/* 내용 */}
            <label className="form-label review-form-label">
              리뷰 내용
              <textarea
                name="content"
                rows={3}
                placeholder="이 책을 읽고 느낀 점을 편하게 적어줘."
                className="textarea review-form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </label>

            {(error || success) && (
              <div className="review-form-message">
                {error && <p className="review-form-message error">{error}</p>}
                {success && (
                  <p className="review-form-message success">{success}</p>
                )}
              </div>
            )}

            <div className="review-form-footer">
              <button
                type="submit"
                className="btn btn-primary review-form-submit"
                disabled={loading}
              >
                {loading ? '등록 중…' : '리뷰 등록'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
