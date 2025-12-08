"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [showSignupSuggestion, setShowSignupSuggestion] =
    useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("");
    setShowSignupSuggestion(false);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();

      if (!res.ok) {
        setMessage(text);

        // ✅ 없는 이메일인 경우만 회원가입 제안
        if (res.status === 404) {
          setShowSignupSuggestion(true);
        }

        setLoading(false);
        return;
      }

      // 로그인 성공
      router.push("/");
    } catch (err) {
      setMessage("잠시만 기다려 주십시오.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <section className="section">
        <h1>로그인</h1>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p>{message}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "확인 중…" : "로그인"}
        </button>

        {/* 🌱 회원가입 제안 */}
        {showSignupSuggestion && (
          <div>
            <p>아직 계정이 없는 이메일이야.</p>
            <button
              onClick={() => router.push("/signup")}
            >
              회원가입 하러 갈까?
            </button>
          </div>
        )}
      </section>
  );
}
