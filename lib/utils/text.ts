// lib/utils/text.ts

/** Google Books 설명처럼 HTML 태그가 섞인 문자열에서 태그를 제거하고 텍스트만 남김 */
export function stripHtml(raw: string | undefined | null): string {
  if (!raw) return ''

  // 1) HTML 태그 제거
  const withoutTags = raw.replace(/<\/?[^>]+(>|$)/g, '')

  // 2) &nbsp; 같은 공백 엔티티 정리
  const normalizedSpaces = withoutTags.replace(/&nbsp;?/gi, ' ')

  // 3) 줄바꿈 엔티티(<br>를 이미 지웠으니 \n 기준으로 정리해도 됨)
  const trimmed = normalizedSpaces.replace(/\s+\n/g, '\n').trim()

  return trimmed
}