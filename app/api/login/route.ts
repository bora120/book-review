// /app/api/login/route.ts
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(req: Request): Promise<Response> {
  try {
    // 1. 먼저 MongoDB 연결
    await connectDB()

    // 2. 요청 바디에서 이메일/비밀번호 가져오기
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response('이메일과 비밀번호 필요합니다.', { status: 400 })
    }

    // 3. MongoDB에서 해당 이메일을 가진 유저 찾기
    const user = await User.findOne({ email })

    if (!user) {
      return new Response('존재하지 않는 이메일입니다.', { status: 404 })
    }

    // 4. 비밀번호 확인 (지금은 단순 문자열 비교)
    // 나중에는 bcrypt로 암호화해서 비교하는 걸로 바꾸는 게 좋음!
    if (user.password !== password) {
      return new Response('비밀번호가 틀렸습니다.', { status: 401 })
    }

    // 5. 이메일 인증 여부 확인(옵션)
    // User Schema에 verified 필드가 있다면 이렇게 체크
    if (user.verified === false) {
      return new Response('이메일 인증이 필요합니다.', { status: 403 })
    }

    // 6. 성공
    return new Response('로그인 성공!', { status: 200 })
  } catch (error) {
    console.error('로그인 오류:', error)
    return new Response('서버 오류가 발생했습니다.', { status: 500 })
  }
}
