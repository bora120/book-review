// app/page.tsx
import Link from 'next/link'
import { searchBooks } from '@/lib/api/googleBooks'
import { communityPosts } from '@/lib/data/community'

// 매 요청마다 추천이 조금씩 바뀌게
export const dynamic = 'force-dynamic'

const RECOMMEND_KEYWORDS = [
  '프로그래밍',
  '개발',
  '소설',
  '에세이',
  '인문',
  '역사',
  '심리학',
  '언어 공부',
]

export default async function HomePage() {
  // 키워드 하나 랜덤 선택
  const keyword =
    RECOMMEND_KEYWORDS[Math.floor(Math.random() * RECOMMEND_KEYWORDS.length)]

  // 해당 키워드로 도서 검색
  const allBooks = await searchBooks(keyword, 20)
  const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
  const featuredBooks = shuffled.slice(0, 3)

  const hotPosts = Array.isArray(communityPosts)
    ? communityPosts.slice(0, 3)
    : []

  return (
    <div className="page">
      {/* 히어로 섹션 */}
      <section className="section section-hero">
        <div className="section-hero-inner">
          <h1 className="hero-title">
            독서를 기록하고
            <br />
            함께 이야기하는 공간
          </h1>
          <p className="hero-subtitle">
            도서를 검색하고 리뷰를 남기고,
            <br />
            커뮤니티에서 토론과 투표로 의견을 나누는 독서 리뷰 플랫폼입니다.
          </p>

          <div className="hero-actions">
            <Link href="/books" className="btn btn-primary">
              도서 검색하러 가기
            </Link>
            <Link href="/community" className="btn btn-ghost">
              커뮤니티 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* 오늘의 추천 도서 (Google Books 기반 랜덤 3권) */}
      <section className="section">
        <header className="section-header">
          <h2 className="section-title">오늘의 추천 도서</h2>
          <p className="section-description">
            Google Books에서 &quot;{keyword}&quot; 키워드로 검색한 결과 중,
            <br />
            랜덤으로 선택된 3권을 보여줍니다.
          </p>
        </header>

        <div className="card-grid">
          {featuredBooks.length === 0 ? (
            <p className="muted-text">
              추천 도서를 불러오지 못했습니다. 잠시 후 다시 시도해 보세요.
            </p>
          ) : (
            featuredBooks.map((book, index) => (
              <article key={book.id} className="card card-book">
                <div className="card-body">
                  <p className="meta-text meta-muted">
                    오늘의 추천 #{index + 1}
                  </p>

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
                          maxWidth: 140,
                          height: 'auto',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}

                  <h3 className="card-title">{book.title}</h3>

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
                    이 책 더 자세히 보기
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* 커뮤니티 하이라이트 섹션 (기존 구조 유지) */}
      <section className="section">
        <header className="section-header">
          <h2 className="section-title">지금 뜨거운 커뮤니티</h2>
          <p className="section-description">
            자유롭게 책 이야기를 나누고, 토론과 투표에 참여해 보세요.
          </p>
        </header>

        <div className="card-list">
          {hotPosts.length === 0 ? (
            <p className="muted-text">
              아직 게시글이 없습니다. 첫 글을 올려서 커뮤니티를 시작해 보세요!
            </p>
          ) : (
            hotPosts.map((post) => (
              <article key={post.id} className="card card-post">
                <div className="card-body">
                  <div className="card-meta-row">
                    <span className="badge badge-outline">{post.category}</span>
                    {post.hasPoll && (
                      <span className="badge badge-primary">투표 진행 중</span>
                    )}
                  </div>

                  <h3 className="card-title">
                    <Link href={`/community/${post.id}`}>{post.title}</Link>
                  </h3>

                  {post.excerpt && (
                    <p className="card-text line-clamp-2">{post.excerpt}</p>
                  )}
                </div>

                <div className="card-footer">
                  <Link
                    href={`/community/${post.id}`}
                    className="btn btn-sm btn-ghost"
                  >
                    게시글 보기
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="section-footer">
          <Link href="/community" className="link-more">
            커뮤니티 전체 보기 →
          </Link>
        </div>
      </section>
    </div>
  )
}