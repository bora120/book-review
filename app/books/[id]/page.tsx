// app/books/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { stripHtml } from '@/lib/utils/text'

type GoogleBook = {
  id: string
  title: string
  authors: string[]
  description: string
  categories: string[]
  thumbnail: string | null
  publishedDate: string | null
  publisher: string | null
  pageCount: number | null
}

// 브라우저에서 Google Books 단일 도서 조회
async function fetchBookDetail(id: string): Promise<GoogleBook | null> {
  if (!id) return null

  const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(
    id
  )}`

  const res = await fetch(url)

  if (!res.ok) {
    console.error('Google Books getById 실패', res.status, await res.text())
    return null
  }

  const data = await res.json()
  const info = data?.volumeInfo ?? {}
  const imageLinks = info.imageLinks ?? {}

  return {
    id: String(data.id ?? ''),
    title: info.title ?? '제목 정보 없음',
    authors: Array.isArray(info.authors) ? info.authors : [],
    description: stripHtml(info.description),
    categories: Array.isArray(info.categories) ? info.categories : [],
    thumbnail: imageLinks.thumbnail ?? imageLinks.smallThumbnail ?? null,
    publishedDate: info.publishedDate ?? null,
    publisher: info.publisher ?? null,
    pageCount: typeof info.pageCount === 'number' ? info.pageCount : null,
  }
}

export default function BookDetailPage() {
  const params = useParams()

  // params.id 타입이 string | string[] | undefined 라서 안전하게 처리
  const rawId = (params as { id?: string | string[] })?.id
  const id =
    typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : ''

  const [book, setBook] = useState<GoogleBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('잘못된 도서 ID입니다.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchBookDetail(id)
        if (!cancelled) {
          if (!result) {
            setError('도서 정보를 찾을 수 없습니다.')
            setBook(null)
          } else {
            setBook(result)
          }
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError('도서 정보를 불러오는 중 오류가 발생했습니다.')
          setBook(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="page">
      {/* 상단 헤더 */}
      <header className="section-header section-header-with-back">
        <div>
          <p className="breadcrumb">
            <Link href="/books" className="breadcrumb-link">
              도서 검색
            </Link>{' '}
            <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">
              {book ? book.title : '도서 상세'}
            </span>
          </p>
          <h1 className="section-title">
            {book ? book.title : '도서 상세 정보'}
          </h1>
          {book && (
            <p className="section-description">
              {book.authors.length > 0
                ? `저자 ${book.authors.join(', ')}`
                : '저자 정보 없음'}
              {book.publisher ? ` · ${book.publisher}` : ''}
              {book.publishedDate ? ` · 출간 ${book.publishedDate}` : ''}
            </p>
          )}
        </div>

        <div className="header-actions">
          <Link href="/" className="btn btn-sm btn-ghost">
            ← 홈으로
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <section className="section section-book-detail">
        {loading && (
          <p className="muted-text">도서 정보를 불러오는 중입니다...</p>
        )}
        {error && <p className="muted-text">{error}</p>}

        {!loading && !error && !book && (
          <p className="muted-text">도서 정보를 찾을 수 없습니다.</p>
        )}

        {book && (
          <div className="book-detail-layout">
            <div className="book-main">
              <div className="card card-surface">
                <div className="card-body">
                  {/* 썸네일 */}
                  {book.thumbnail && (
                    <div style={{ marginBottom: 16 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        style={{
                          borderRadius: 8,
                          width: '100%',
                          maxWidth: 220,
                          height: 'auto',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}

                  <h2 className="card-title">책 소개</h2>
                  {book.description ? (
                    <p className="card-text">{book.description}</p>
                  ) : (
                    <p className="muted-text">
                      이 책에 대한 설명이 제공되지 않습니다.
                    </p>
                  )}

                  <div className="card-stats" style={{ marginTop: 12 }}>
                    {book.categories.length > 0 && (
                      <span className="badge badge-soft">
                        {book.categories[0]}
                      </span>
                    )}
                    {book.pageCount && (
                      <span className="badge badge-soft">
                        {book.pageCount}쪽
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 나중에 우리 플랫폼 리뷰 넣을 자리 */}
            <aside className="book-side">
              <div className="card card-surface">
                <div className="card-body">
                  <h2 className="card-title">플랫폼 리뷰 & 메모</h2>
                  <p className="muted-text">
                    나중에 이 플랫폼에서 작성한 리뷰, 별점, 메모 등을
                    <br />이 영역에 표시하도록 확장할 수 있습니다.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  )
}