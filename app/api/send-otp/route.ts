// /app/api/send-otp/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return new NextResponse('이메일 필요', { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // DB 연결
    await connectDB()

    // 🔍 기존: users 배열 → 변경: MongoDB에서 유저 찾기
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return new NextResponse('사용자를 찾을 수 없어.', { status: 404 })
    }

    // 🔐 OTP 생성
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 유저 문서에 OTP 업데이트
    ;(user as any).otp = otp
    ;(user as any).verified = false
    await user.save()

    console.log(`📨 OTP 발급 (테스트용): ${otp} for ${email}`)

    // 테스트용: OTP 반환
    return NextResponse.json({ success: true, otp })
  } catch (err) {
    console.error('[send-otp] 에러:', err)
    return new NextResponse('OTP 발급 실패', { status: 500 })
  }
}
