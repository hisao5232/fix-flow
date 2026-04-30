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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [existingReservations, setExistingReservations] = useState<any[]>([]) // その日の予約
  const supabase = createClient()
  const router = useRouter()

  const workers = ['作業員A', '作業員B', '作業員C', '作業員D']
  const timeSlots = []
  for (let h = 7; h <= 18; h++) {
    for (let m of ['00', '30']) {
      if (h === 7 && m === '00') continue
      if (h === 18 && m === '30') break
      timeSlots.push(`${String(h).padStart(2, '0')}:${m}`)
    }
  }

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email ?? 'ログイン中')
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  // 日付クリック時に予約データを取得
  const handleDateClick = async (value: any) => {
    const date = new Date(value)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    
    setSelectedDate(dateStr)

    // Supabaseからその日の予約をすべて取得
    const { data, error } = await supabase
      .from('repair_requests')
      .select('worker_name, start_time')
      .eq('appointment_date', dateStr)

    if (!error && data) {
      setExistingReservations(data)
    }
  }

  // 特定の枠が予約済み（または3時間の作業中）か判定する関数
  const isReserved = (worker: string, currentTime: string) => {
    return existingReservations.some(res => {
      if (res.worker_name !== worker) return false
      
      // 開始時間と現在の枠の時間を数値（分）に変換して比較
      const [startH, startM] = res.start_time.split(':').map(Number)
      const [currH, currM] = currentTime.split(':').map(Number)
      
      const startInMinutes = startH * 60 + startM
      const currInMinutes = currH * 60 + currM
      
      // 開始時間から180分（3時間）以内であれば予約済みとする
      return currInMinutes >= startInMinutes && currInMinutes < startInMinutes + 180
    })
  }

  const handleTimeSlotClick = (worker: string, time: string) => {
    if (isReserved(worker, time)) return // 予約済みなら何もしない
    router.push(`/form?date=${selectedDate}&time=${time}&worker=${worker}`)
  }

  if (loading) return <div className="p-10 text-black font-bold text-center">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50 text-black text-sm">
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

        {selectedDate && (
          <div className="mt-8 w-full max-w-5xl bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-900 border-b pb-2">
              📅 {selectedDate.replace(/-/g, '/')} の空き状況
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-300 p-2 w-16">時間</th>
                    {workers.map(w => (
                      <th key={w} className="border border-gray-300 p-2">{w}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="border border-gray-300 p-1 text-center text-xs font-bold bg-gray-100">
                        {time}
                      </td>
                      {workers.map(worker => {
                        const reserved = isReserved(worker, time)
                        return (
                          <td 
                            key={`${worker}-${time}`}
                            onClick={() => handleTimeSlotClick(worker, time)}
                            className={`border border-gray-300 p-2 text-center text-xs transition-colors ${
                              reserved 
                                ? 'bg-red-100 text-red-500 cursor-not-allowed font-bold' 
                                : 'cursor-pointer hover:bg-blue-100 text-blue-600'
                            }`}
                          >
                            {reserved ? '■ 予約済' : '＋ 予約'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-10 mb-10 w-full max-w-2xl flex justify-center">
          <Link href="/admin/list" className="bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition-all shadow-md">
            📊 予約一覧を表示
          </Link>
        </div>
      </main>
    </div>
  )
}
