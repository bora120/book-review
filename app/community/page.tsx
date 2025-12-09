// app/community/page.tsx
import Link from 'next/link'
import { communityPosts, comments } from '@/lib/data/community'

type CommunityPageProps = {
  searchParams?: {
    category?: string
  }
}

export default function CommunityPage({
  searchParams = {}, // ✅ 핵심: 기본값
}: CommunityPageProps) {
  const currentCategory =
    typeof searchParams.category === 'string' ? searchParams.category : '전체'

  // 카테고리 목록 생성
  const categorySet = new Set(communityPosts.map((p) => p.category))
  const categories = ['전체', ...Array.from(categorySet)]

  // 댓글 수 계산
  const postsWithStats = communityPosts.map((post) => {
    const commentCount = comments.filter((c) => c.postId === post.id).length
    return { ...post, commentCount }
  })

  // 카테고리 필터링
  const filteredPosts =
    currentCategory === '전체'
      ? postsWithStats
      : postsWithStats.filter((post) => post.category === currentCategory)

  // 최신순 → 댓글순 정렬
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt)
    }
    return (b.commentCount ?? 0) - (a.commentCount ?? 0)
  })

  return (
    <div className="page">
      {/* 헤더 */}
      <header className="section-header">
        <h1 className="section-title">커뮤니티</h1>
        <p className="section-description">
          책에 대한 생각을 자유롭게 나누고, 토론과 투표에 참여해 보세요.
        </p>
      </header>

      {/* 카테고리 탭 */}
      <nav className="tabs">
        {categories.map((cat) => {
          const isActive = currentCategory === cat
          const href =
            cat === '전체'
              ? '/community'
              : `/community?category=${encodeURIComponent(cat)}`

          return (
            <Link
              key={cat}
              href={href}
              className={'tab-item' + (isActive ? ' tab-item-active' : '')}
            >
              {cat}
            </Link>
          )
        })}
      </nav>

      {/* 툴바 */}
      <div className="section-toolbar">
        <p className="muted-text">
          총 {sortedPosts.length}개의 게시글이 있습니다.
        </p>
        <button type="button" className="btn btn-outline">
          + (예정) 게시글 작성하기
        </button>
      </div>

      {/* 게시글 목록 */}
      {sortedPosts.length === 0 ? (
        <p className="muted-text">
          아직 이 카테고리에 해당하는 게시글이 없습니다. 첫 글을 남겨보세요!
        </p>
      ) : (
        <ul className="post-list">
          {sortedPosts.map((post) => (
            <li key={post.id} className="card card-post">
              <div className="card-body">
                <div className="card-meta-row">
                  <span className="badge badge-outline">{post.category}</span>
                  {post.hasPoll && (
                    <span className="badge badge-primary">투표글</span>
                  )}
                </div>

                <h2 className="card-title">
                  <Link href={`/community/${post.id}`}>{post.title}</Link>
                </h2>

                {post.excerpt && (
                  <p className="card-text line-clamp-2">{post.excerpt}</p>
                )}

                <div className="card-meta-row">
                  <span className="meta-text">작성자 {post.nickname}</span>
                  <span className="meta-text meta-muted">
                    {post.createdAt ?? ''}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <div className="post-footer-left">
                  <span className="meta-text">
                    💬 댓글 {post.commentCount ?? 0}개
                  </span>
                </div>
                <div className="post-footer-right">
                  <Link
                    href={`/community/${post.id}`}
                    className="btn btn-sm btn-ghost"
                  >
                    게시글 보기
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
