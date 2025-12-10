// /app/api/signup/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: Request) {
  try {
    // 1. 요청 바디 파싱
    const body = await req.json()

    const rawEmail = body.email as string | undefined
    const rawPassword = body.password as string | undefined
    const rawName = body.name as string | undefined

    // 공백 제거 + 이메일은 소문자로 통일
    const email = rawEmail?.trim().toLowerCase() ?? ''
    const password = rawPassword?.trim() ?? ''

    // name이 안 넘어오거나 빈 문자열이면 기본값으로 채워서
    // "Path `name` is required" 에러가 안 나도록 처리
    const name = rawName?.trim() || '이름없음'

    // 2. 필수값 체크
    if (!email || !password) {
      return new NextResponse('입력 부족', { status: 400 })
    }

    // 3. MongoDB 연결
    await connectDB()

    // 4. 이메일 중복 체크
    const exists = await User.findOne({ email })
    if (exists) {
      return new NextResponse('이미 가입된 이메일이야.', { status: 409 })
    }

    // 5. 새 유저 생성
    const newUser = await User.create({
      email,
      password, // ⚠️ 지금은 평문, 나중에 bcrypt로 암호화 추천
      name,
      // otp, verified 같은 필드가 스키마에 있으면 여기서 같이 넣어도 됨
    })

    console.log(`✅ Signup 완료: ${email}`, newUser._id)

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      message: '회원가입 완료',
    })
  } catch (error) {
    console.error('[SIGNUP] 에러:', error)
    return new NextResponse('서버 에러가 발생했어.', { status: 500 })
  }
}
