// app/books/page.tsx
'use client'

import { useState, FormEvent } from 'react'
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

// 브라우저에서 직접 Google Books 호출
async function searchBooksClient(
  query: string,
  maxResults = 30
): Promise<GoogleBook[]> {
  const q = query.trim()
  if (!q) return []

  const url =
    'https://www.googleapis.com/books/v1/volumes' +
    `?q=${encodeURIComponent(q)}` +
    `&maxResults=${maxResults}` +
    `&printType=books` +
    `&langRestrict=ko`

  const res = await fetch(url)

  if (!res.ok) {
    // 여기서 throw 하면 catch에서 처리 → 화면에 에러 메시지로만 표시
    throw new Error(`Google Books 요청 실패: ${res.status}`)
  }

  const data = await res.json()
  const items = Array.isArray(data.items) ? data.items : []

  return items.map((item: any) => {
    const info = item?.volumeInfo ?? {}
    const imageLinks = info.imageLinks ?? {}

    return {
      id: String(item.id ?? ''),
      title: info.title ?? '제목 정보 없음',
      authors: Array.isArray(info.authors) ? info.authors : [],
      description: stripHtml(info.description),
      categories: Array.isArray(info.categories) ? info.categories : [],
      thumbnail: imageLinks.thumbnail ?? imageLinks.smallThumbnail ?? null,
      publishedDate: info.publishedDate ?? null,
      publisher: info.publisher ?? null,
      pageCount: typeof info.pageCount === 'number' ? info.pageCount : null,
    }
  })
}

export default function BooksPage() {
  const [input, setInput] = useState('')
  const [books, setBooks] = useState<GoogleBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const q = input.trim()
    if (!q) {
      setBooks([])
      setHasSearched(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const result = await searchBooksClient(q, 30)
      setBooks(result)
    } catch (err) {
      console.error(err)
      setError('도서를 불러오는 중 오류가 발생했습니다.')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="section-header">
        <h1 className="section-title">도서 검색</h1>
        <p className="section-description">
          Google Books에서 도서 정보를 불러와 보여줍니다.
          <br />
          제목, 저자, 키워드로 검색해 원하는 책을 찾아보세요.
        </p>
      </header>

      <section className="section">
        {/* 검색 폼 */}
        <form
          onSubmit={handleSubmit}
          className="search-form"
          style={{ marginBottom: 16 }}
        >
          <input
            type="text"
            placeholder="제목, 저자, 키워드로 검색"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            검색
          </button>
        </form>

        {/* 상태 메시지들 */}
        {!hasSearched && (
          <p className="muted-text">
            위 입력창에 검색어를 입력한 후 &quot;검색&quot; 버튼을 눌러보세요.
          </p>
        )}

        {loading && <p className="muted-text">도서를 불러오는 중입니다...</p>}

        {error && <p className="muted-text">{error}</p>}

        {/* 검색 결과 */}
        <div className="card-grid">
          {hasSearched && !loading && !error && books.length === 0 && (
            <p className="muted-text">
              검색 결과가 없습니다. 다른 키워드로 다시 시도해 보세요.
            </p>
          )}

          {books.map((book) => (
            <article key={book.id} className="card card-book">
              <div className="card-body">
                {/* 썸네일 */}
                {book.thumbnail && (
                  <div style={{ marginBottom: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      style={{
                        borderRadius: 8,
                        width: '100%',
                        maxWidth: 120,
                        height: 'auto',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                <h2 className="card-title">{book.title}</h2>
                <p className="card-meta">
                  {book.authors.length > 0
                    ? `저자 ${book.authors.join(', ')}`
                    : '저자 정보 없음'}
                </p>

                {book.description && (
                  <p className="card-text line-clamp-3">{book.description}</p>
                )}

                <div className="card-stats">
                  {book.categories.length > 0 && (
                    <span className="badge badge-soft">
                      {book.categories[0]}
                    </span>
                  )}
                  {book.publishedDate && (
                    <span className="badge badge-soft">
                      출간 {book.publishedDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <Link
                  href={`/books/${book.id}`}
                  className="btn btn-sm btn-outline"
                >
                  상세 보기
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}