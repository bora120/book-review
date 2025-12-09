// app/api/reviews/route.ts
import { NextResponse } from 'next/server'

export type Review = {
  id: string
  bookId: string
  userEmail: string
  userName: string
  rating: number
  content: string
  createdAt: string
}

// 서버 메모리에 임시 저장 (진짜 서비스면 DB로 교체해야 함)
let reviewDB: Review[] = []

// [POST] 리뷰 작성
export async function POST(req: Request) {
  let body: any

  // 1) JSON 파싱 안전 처리
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'JSON 형식의 요청만 허용됩니다.' },
      { status: 400 }
    )
  }

  const {
    bookId,
    rating,
    content,
    userEmail,
    userName,
  }: {
    bookId?: string
    rating?: number
    content?: string
    userEmail?: string
    userName?: string
  } = body ?? {}

  // 2) 로그인/필수값 검증
  if (!userEmail || !userName) {
    return NextResponse.json(
      {
        success: false,
        message:
          '리뷰 작성은 로그인 후에만 가능합니다. (userEmail, userName 필요)',
      },
      { status: 401 }
    )
  }

  if (!bookId || typeof bookId !== 'string') {
    return NextResponse.json(
      { success: false, message: '유효한 bookId 값이 필요합니다.' },
      { status: 400 }
    )
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json(
      { success: false, message: '리뷰 내용(content)을 입력해주세요.' },
      { status: 400 }
    )
  }

  const numericRating = Number(rating)
  if (
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return NextResponse.json(
      { success: false, message: '별점(rating)은 1~5 사이의 숫자여야 합니다.' },
      { status: 400 }
    )
  }

  // 3) 새 리뷰 객체 생성
  const newReview: Review = {
    id: Date.now().toString(),
    bookId,
    userEmail,
    userName,
    rating: numericRating,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  }

  // 4) 메모리 DB에 저장
  reviewDB.push(newReview)

  // 5) 결과 응답
  return NextResponse.json(
    {
      success: true,
      review: newReview,
    },
    { status: 201 }
  )
}

// [GET] 리뷰 조회 (?bookId=... 로 필터링, 누구나 가능)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bookId = searchParams.get('bookId')

  let result: Review[]

  if (bookId) {
    result = reviewDB.filter((r) => r.bookId === bookId)
  } else {
    // bookId가 없으면 전체 리뷰 반환 (필요 없으면 여기서 막으면 됨)
    result = reviewDB
  }

  return NextResponse.json(result, { status: 200 })
}
