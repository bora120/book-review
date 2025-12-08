// lib/api/googleBooks.ts

export type GoogleBook = {
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

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1'

// Google Books 검색
export async function searchBooks(
  q: string,
  maxResults = 20
): Promise<GoogleBook[]> {
  if (!q.trim()) return []

  const url =
    `${GOOGLE_BOOKS_BASE}/volumes` +
    `?q=${encodeURIComponent(q)}` +
    `&maxResults=${maxResults}` +
    `&printType=books` +
    `&langRestrict=ko`

  const res = await fetch(url, {
    // 적당히 60초 캐싱 (원하면 바꿔도 됨)
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    console.error('Google Books search failed', res.status, await res.text())
    return []
  }

  const data = await res.json()
  const items = Array.isArray(data.items) ? data.items : []

  return items.map(mapVolumeToBook)
}

// Google Books 단일 도서 조회
export async function getBookById(id: string): Promise<GoogleBook | null> {
  if (!id) return null

  const url = `${GOOGLE_BOOKS_BASE}/volumes/${encodeURIComponent(id)}`

  const res = await fetch(url, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    console.error('Google Books getById failed', res.status, await res.text())
    return null
  }

  const data = await res.json()
  return mapVolumeToBook(data)
}

// 내부 공통 매핑 함수
function mapVolumeToBook(volume: any): GoogleBook {
  const info = volume?.volumeInfo ?? {}
  const imageLinks = info.imageLinks ?? {}

  return {
    id: String(volume.id ?? ''),
    title: info.title ?? '제목 정보 없음',
    authors: Array.isArray(info.authors) ? info.authors : [],
    description: info.description ?? '',
    categories: Array.isArray(info.categories) ? info.categories : [],
    thumbnail: imageLinks.thumbnail ?? imageLinks.smallThumbnail ?? null,
    publishedDate: info.publishedDate ?? null,
    publisher: info.publisher ?? null,
    pageCount: typeof info.pageCount === 'number' ? info.pageCount : null,
  }
}