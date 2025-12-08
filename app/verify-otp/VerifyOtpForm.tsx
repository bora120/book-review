'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyOtpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setEmail(searchParams.get('email') || '')
  }, [])

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 mock

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('인증 코드는 6자리입니다.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })

    if (res.ok) {
      setIsLoggedIn(true) // 인증 성공 → 로그인 상태 mock
      router.push('/signup/complete')
    } else {
      const msg = await res.text()
      setError(msg || '인증에 실패했습니다.')
    }

    setLoading(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl space-y-5">
        <h1 className="text-xl font-semibold text-center">
          이메일 인증
        </h1>

        <p className="text-sm text-gray-600 text-center">
          {email}
          <br />
          이 주소로 보낸 숫자 6개를 입력해주세요.
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          placeholder="000000"
          className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-widest"
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {!isLoggedIn ? (
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            인증하기
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 text-white rounded-lg"
          >
            로그아웃
          </button>
        )}
      </div>
    </div>
  )
}
