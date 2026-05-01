'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Link from 'next/link'

export default function CalendarPage() {
  // --- 1. 状態管理（State） ---
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null) // モーダルの表示判定も兼ねる
  const [existingReservations, setExistingReservations] = useState<any[]>([]) // モーダル内のタイムテーブル用
  const [allReservations, setAllReservations] = useState<any[]>([]) // カレンダー全体のドット表示用

  const supabase = createClient()
  const router = useRouter()

  // 基本設定
  const workers = ['作業員A', '作業員B', '作業員C', '作業員D']
  const timeSlots = []
  for (let h = 7; h <= 18; h++) {
    for (let m of ['00', '30']) {
      if (h === 7 && m === '00') continue
      if (h === 18 && m === '30') break
      timeSlots.push(`${String(h).padStart(2, '0')}:${m}`)
    }
  }

  // --- 2. 初期データ取得（ログインチェック ＋ 全予約の把握） ---
  useEffect(() => {
    async function initialize() {
      // ユーザーがログインしているか確認
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email ?? 'ログイン中')

      // カレンダーに「◯件」と表示するために、全日程の予約日だけを取得
      const { data } = await supabase
        .from('repair_requests')
        .select('appointment_date')
      
      if (data) setAllReservations(data)
      setLoading(false)
    }
    initialize()
  }, [router, supabase])

  // --- 3. カレンダーの見た目をカスタマイズする関数 ---

  // 日付の下に「件数バッジ」を追加する
  const getTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null
    
    // 日付を 'YYYY-MM-DD' 形式に変換して、その日の予約数をカウント
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const count = allReservations.filter(r => r.appointment_date === dateStr).length

    if (count > 0) {
      return (
        <div className="text-[10px] mt-1 bg-orange-100 text-orange-700 font-bold rounded px-1">
          {count}件
        </div>
      )
    }
    return null
  }

  // --- 予約済み判定ロジックを「データ返却」用に書き換え ---
  const getReservationData = (worker: string, currentTime: string) => {
    return existingReservations.find(res => {
      if (res.worker_name !== worker) return false
      const [startH, startM] = res.start_time.split(':').map(Number)
      const [currH, currM] = currentTime.split(':').map(Number)
      const startInMinutes = startH * 60 + startM
      const currInMinutes = currH * 60 + currM
      
      // 開始から180分（3時間）の範囲内にあるデータを探す
      return currInMinutes >= startInMinutes && currInMinutes < startInMinutes + 180
    })
  }

  // 予約がある日にCSSクラス「has-reservation」を付与する
  const getTileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return ''
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const hasReservation = allReservations.some(r => r.appointment_date === dateStr)
    
    return hasReservation ? 'has-reservation' : ''
  }

  // --- 4. インタラクション（クリック処理） ---

  // カレンダーの日付をクリックした時：その日の詳細データを取得してモーダルを開く
  const handleDateClick = async (value: any) => {
    const date = new Date(value)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // タイムテーブル描画に必要な「作業員名」と「開始時間」を取得
    const { data, error } = await supabase
      .from('repair_requests')
      .select('worker_name, start_time, customer_name, location, machine_type, issue_description')
      .eq('appointment_date', dateStr)

    if (!error && data) {
      setExistingReservations(data)
      setSelectedDate(dateStr) // 日付がセットされるとモーダルが出現
    }
  }

  // タイムテーブル内の枠が「3時間以内」かどうかを判定
  const isReserved = (worker: string, currentTime: string) => {
    return existingReservations.some(res => {
      if (res.worker_name !== worker) return false
      const [startH, startM] = res.start_time.split(':').map(Number)
      const [currH, currM] = currentTime.split(':').map(Number)
      
      const startInMinutes = startH * 60 + startM
      const currInMinutes = currH * 60 + currM
      
      // 開始から180分（3時間）の範囲をブロック
      return currInMinutes >= startInMinutes && currInMinutes < startInMinutes + 180
    })
  }

  const handleTimeSlotClick = (worker: string, time: string) => {
    if (isReserved(worker, time)) return
    router.push(`/form?date=${selectedDate}&time=${time}&worker=${worker}`)
  }

  if (loading) return <div className="p-10 text-black font-bold text-center">読み込み中...</div>

  // --- 5. UI（レンダリング） ---
  return (
    <div className="min-h-screen bg-gray-50 text-black text-sm relative">
      <header className="bg-white border-b px-4 py-3 shadow-sm flex justify-between items-center relative z-10">
        <h2 className="text-xl font-bold text-gray-900">修理スケジュール</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700">👤 {userEmail}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
                  className="bg-red-600 text-white text-xs font-bold py-2 px-3 rounded shadow-sm active:scale-95 transition-all">ログアウト</button>
        </div>
      </header>

      <main className="p-4 flex flex-col items-center">
        {/* メインカレンダーカード */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl mt-6">
          <style>{`
            .react-calendar { width: 100%; border: none; font-family: inherit; }
            /* 1日のマスの高さを広げてバッジを表示しやすくする */
            .react-calendar__tile { 
              height: 90px !important; 
              display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
              padding-top: 10px !important;
            }
            /* 予約がある日の背景色を薄いオレンジにする自作クラス */
            .has-reservation { background-color: #fff7ed !important; transition: background-color 0.2s; }
            .has-reservation:hover { background-color: #ffedd5 !important; }
            
            .react-calendar__tile--now { background: #e0f2fe; color: #0369a1; font-weight: bold; }
            .react-calendar__tile--active { background: #1d4ed8 !important; color: white !important; }
            .react-calendar__month-view__days__day { color: black; font-weight: 600; border: 0.5px solid #f3f4f6; }
          `}</style>
          
          <Calendar 
            onClickDay={handleDateClick} 
            locale="ja-JP" 
            calendarType="gregory" 
            tileContent={getTileContent}
            tileClassName={getTileClassName}
          />
        </div>

        {/* モーダル：日付クリック時にふわっと表示 */}
        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden scale-in-center">
              
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">
                  📅 {selectedDate.replace(/-/g, '/')} の空き状況
                </h3>
                <button onClick={() => setSelectedDate(null)} className="text-4xl text-gray-400 hover:text-gray-600 leading-none focus:outline-none">&times;</button>
              </div>

              <div className="p-6 overflow-y-auto bg-white">
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-inner">
                  <table className="min-w-full border-collapse table-fixed bg-white">
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-gray-800 text-white">
                        <th className="p-2 w-16 border-r border-gray-700 text-center text-xs">時間</th>
                        {workers.map(w => <th key={w} className="p-2 border-r border-gray-700 text-sm font-medium">{w}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(time => (
                        <tr key={time} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-1 text-center text-[10px] font-bold bg-gray-100 border-r border-gray-200 sticky left-0 z-10">
                            {time}
                          </td>
                          {workers.map(worker => {
                            // ここで予約データを取得
                            const res = getReservationData(worker, time)
                            const reserved = !!res // データがあれば予約済み

                            return (
                              <td 
                                key={`${worker}-${time}`}
                                onClick={() => handleTimeSlotClick(worker, time)}
                                className={`p-1 text-center text-[9px] border-r border-gray-100 transition-all leading-tight h-12 ${
                                  reserved 
                                    ? 'bg-red-50 text-red-500 cursor-not-allowed' 
                                    : 'cursor-pointer hover:bg-blue-100 text-blue-600 font-bold'
                                }`}
                              >
                                {reserved ? (
                                  <div className="flex flex-col items-center justify-center overflow-hidden whitespace-nowrap">
                                    <span className="font-bold">{res.customer_name?.slice(0, 5)}...</span>
                                    <span className="text-[8px] text-gray-400 scale-90">{res.location?.slice(0, 5)}</span>
                                    <span className="text-gray-500 scale-90">{res.machine_type?.slice(0, 5)}</span>
                                  </div>
                                ) : (
                                  '＋'
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="px-8 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 shadow-sm transition-all"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 mb-10 w-full max-w-2xl flex justify-center gap-4">
          <Link href="/admin/list" className="bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition-all shadow-md active:scale-95">
            📊 予約一覧を表示
          </Link>
        </div>
      </main>
    </div>
  )
}
