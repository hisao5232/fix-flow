'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('ログイン失敗: ' + error.message)
    } else {
      router.push('/') // ログイン成功後、カレンダー画面へ遷移
    }
    setLoading(false)
  }

  const inputStyle = "mt-1 block w-full border border-gray-400 rounded-md p-2 text-black bg-white outline-none focus:border-blue-500"

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">管理者ログイン</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900">メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-2 rounded-md hover:bg-black disabled:bg-gray-400 transition-colors"
          >
            {loading ? '認証中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
