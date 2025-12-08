// lib/utils/rating.ts

import type { Review } from '@/lib/data/reviews'

/**
 * 특정 bookId 에 대한 평균 평점과 리뷰 개수를 계산
 */
export function getBookRatingStats(
  bookId: string,
  allReviews: Review[]
): { avgRating: number; reviewCount: number } {
  const targetReviews = allReviews.filter((r) => r.bookId === bookId)
  const reviewCount = targetReviews.length

  if (reviewCount === 0) {
    return { avgRating: 0, reviewCount: 0 }
  }

  const sum = targetReviews.reduce((acc, r) => acc + r.rating, 0)
  const avgRating = sum / reviewCount

  return { avgRating, reviewCount }
}

export type RatedItem<T> = T & {
  avgRating: number
  reviewCount: number
}

export function getTopItems<T extends { id: string }>(
  items: T[],
  allReviews: Review[],
  limit: number
): RatedItem<T>[] {
  // 각 item에 평점 정보 붙이기
  const enriched: RatedItem<T>[] = items.map((item) => {
    const { avgRating, reviewCount } = getBookRatingStats(item.id, allReviews)
    return {
      ...item,
      avgRating,
      reviewCount,
    }
  })

  // 리뷰가 1개 이상 있는 것만 후보
  const candidates = enriched.filter((b) => b.reviewCount > 0)

  // 평점 → 리뷰 수 순으로 정렬 (내림차순)
  const sorted = [...candidates].sort((a, b) => {
    if (b.avgRating === a.avgRating) {
      return b.reviewCount - a.reviewCount
    }
    return b.avgRating - a.avgRating
  })

  return sorted.slice(0, Math.max(0, limit))
}

export const getTopBooks = getTopItems