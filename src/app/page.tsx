'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Link from 'next/link'

export default function CalendarPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login') // ログインしてなければ飛ばす
        return
      }
      setUserEmail(user.email ?? 'ログイン中')
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  const handleDateClick = (value: any) => {
    const date = new Date(value)
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD形式
    router.push(`/form?date=${dateStr}`) // フォームへ移動
  }

  if (loading) return <div className="p-10 text-black font-bold text-center">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-white border-b px-4 py-3 shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">修理スケジュール</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700">👤 {userEmail}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
                  className="bg-red-600 text-white text-xs font-bold py-2 px-3 rounded">ログアウト</button>
        </div>
      </header>

      <main className="p-4 flex flex-col items-center">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl mt-6">
          <style>{`
            .react-calendar { width: 100%; border: none; }
            .react-calendar__tile--now { background: #e0f2fe; color: #0369a1; font-weight: bold; }
            .react-calendar__tile--active { background: #1d4ed8 !important; color: white !important; }
            .react-calendar__month-view__days__day { color: black; font-weight: 600; height: 80px; border: 0.5px solid #f3f4f6; }
          `}</style>
          <Calendar onClickDay={handleDateClick} locale="ja-JP" calendarType="gregory" />
        </div>

        {/* 下部に一覧へのリンク */}
        <div className="mt-10 mb-10 w-full max-w-2xl flex justify-center">
          <Link href="/admin/list" className="bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition-all shadow-md">
            📊 予約一覧（データ確認・管理）を表示
          </Link>
        </div>
      </main>
    </div>
  )
}
