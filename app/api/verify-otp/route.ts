// /app/api/verify-otp/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return new NextResponse('이메일과 OTP 필요', { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 🔌 DB 연결
    await connectDB()

    // 🔍 아직 인증 안 된 유저 + 이메일로 찾기
    const user = await User.findOne({
      email: normalizedEmail,
      verified: false,
    })

    if (!user) {
      return new NextResponse('인증 요청이 없어.', { status: 404 })
    }

    // 🔐 OTP 비교
    if ((user as any).otp !== otp) {
      return new NextResponse('OTP가 틀렸어.', { status: 401 })
    }

    // ✅ 인증 완료 처리
    ;(user as any).verified = true
    ;(user as any).otp = null
    await user.save()

    return NextResponse.json({
      success: true,
      message: '이메일 인증 완료',
    })
  } catch (error) {
    console.error('[VERIFY-OTP] 에러:', error)
    return new NextResponse('서버 에러', { status: 500 })
  }
}
