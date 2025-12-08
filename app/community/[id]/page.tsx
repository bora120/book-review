// app/community/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  communityPosts,
  comments,
  polls,
  pollOptions,
} from '@/lib/data/community'

type CommunityPostPageProps = {
  params: {
    id: string
  }
}

export default function CommunityPostPage({ params }: CommunityPostPageProps) {
  const postId = params.id
  const post = communityPosts.find((p) => p.id === postId)

  if (!post) {
    notFound()
  }

  const postComments = comments.filter((c) => c.postId === postId)
  const poll = polls.find((p) => p.postId === postId)
  const options = poll
    ? pollOptions.filter((opt) => opt.pollId === poll.id)
    : []

  return (
    <div className="page">
      <header className="section-header section-header-with-back">
        <div>
          <p className="breadcrumb">
            <Link href="/community" className="breadcrumb-link">
              커뮤니티
            </Link>{' '}
            <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">{post.title}</span>
          </p>
          <h1 className="section-title">{post.title}</h1>

          <p className="section-description">
            <span className="badge badge-outline">{post.category}</span>
            {post.hasPoll && (
              <span className="badge badge-primary badge-spaced">
                투표 진행 중
              </span>
            )}
          </p>
        </div>

        <div className="header-actions">
          <Link href="/community" className="btn btn-sm btn-ghost">
            ← 목록으로
          </Link>
        </div>
      </header>

      <section className="section section-post-detail">
        <div className="post-detail-layout">
          <article className="card card-surface post-main">
            <header className="post-header">
              <div className="post-author">
                <span className="avatar-circle">
                  {post.nickname.slice(0, 1)}
                </span>
                <div>
                  <p className="nickname-text">{post.nickname}</p>
                  {post.createdAt && (
                    <p className="meta-text meta-muted">{post.createdAt}</p>
                  )}
                </div>
              </div>
            </header>

            <div className="post-content">
              <p>{post.content}</p>
            </div>
          </article>

          <aside className="post-side">
            {post.hasPoll && poll && (
              <div className="card card-surface poll-box">
                <h2 className="card-title">투표</h2>
                <p className="card-text">{poll.question}</p>

                {options.length === 0 ? (
                  <p className="muted-text">
                    아직 투표 선택지가 설정되지 않았습니다.
                  </p>
                ) : (
                  <form className="poll-form">
                    <div className="poll-options">
                      {options.map((opt) => {
                        const totalVotes = options.reduce(
                          (sum, o) => sum + o.votes,
                          0
                        )
                        const ratio =
                          totalVotes > 0
                            ? Math.round((opt.votes / totalVotes) * 100)
                            : 0

                        return (
                          <label key={opt.id} className="poll-option">
                            <div className="poll-option-main">
                              <input
                                type="radio"
                                name="pollOption"
                                value={opt.id}
                                className="poll-radio"
                              />
                              <span className="poll-option-text">
                                {opt.text}
                              </span>
                            </div>
                            <div className="poll-option-stats">
                              <span className="meta-text">{opt.votes}표</span>
                              <span className="meta-text meta-muted">
                                {ratio}%
                              </span>
                            </div>
                          </label>
                        )
                      })}
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn btn-primary btn-sm">
                        (예정) 투표하기
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!post.hasPoll && (
              <div className="card card-surface">
                <h2 className="card-title">게시글 정보</h2>
                <p className="card-text">
                  이 글은 <strong>{post.category}</strong> 카테고리에
                  작성되었습니다. 댓글을 통해 자유롭게 의견을 남겨보세요.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* 댓글 목록 */}
      <section className="section">
        <header className="section-header">
          <h2 className="section-title">댓글</h2>
          <p className="section-description">
            서로의 생각을 존중하면서 의견을 나눠보세요.
          </p>
        </header>

        {postComments.length === 0 ? (
          <p className="muted-text">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        ) : (
          <ul className="comment-list">
            {postComments.map((comment) => (
              <li key={comment.id} className="card card-comment">
                <div className="card-body">
                  <div className="comment-header">
                    <div className="comment-author">
                      <span className="avatar-circle">
                        {comment.nickname.slice(0, 1)}
                      </span>
                      <span className="nickname-text">{comment.nickname}</span>
                    </div>
                    {comment.createdAt && (
                      <span className="meta-text meta-muted">
                        {comment.createdAt}
                      </span>
                    )}
                  </div>

                  <p className="card-text">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 댓글 작성 폼 (UI만) */}
      <section className="section">
        <header className="section-header">
          <h2 className="section-title">댓글 작성</h2>
          <p className="section-description">
            닉네임을 입력하고 자유롭게 의견을 남겨보세요. (현재는 UI만 동작)
          </p>
        </header>

        <form className="card card-surface comment-form">
          <div className="form-row">
            <label className="form-label">
              닉네임
              <input
                name="nickname"
                type="text"
                className="input"
                placeholder="댓글에 표시될 이름"
                required
              />
            </label>
          </div>

          <label className="form-label">
            댓글 내용
            <textarea
              name="content"
              rows={3}
              className="textarea"
              placeholder="이 글에 대한 의견을 적어주세요."
              required
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-primary">
              (예정) 댓글 등록
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}