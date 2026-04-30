'use client'

import { useState, useEffect, Suspense, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'

function RepairFormContent() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // 各入力項目の状態管理
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedWorker, setSelectedWorker] = useState('')

  useEffect(() => {
    // URLパラメータから情報を取得 (?date=...&time=...&worker=...)
    const dateQuery = searchParams.get('date')
    const timeQuery = searchParams.get('time')
    const workerQuery = searchParams.get('worker')

    if (dateQuery) setSelectedDate(dateQuery)
    if (timeQuery) setSelectedTime(timeQuery)
    if (workerQuery) setSelectedWorker(workerQuery)
  }, [searchParams])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      customer_name: formData.get('customer_name'),
      location: formData.get('location'),
      machine_type: formData.get('machine_type'),
      issue_description: formData.get('issue_description'),
      appointment_date: formData.get('appointment_date'),
      start_time: formData.get('start_time'),      // 追加
      worker_name: formData.get('worker_name'),    // 追加
    }

    const { error } = await supabase.from('repair_requests').insert([data])

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('予約を登録しました！')
      router.push('/') // カレンダーに戻る
    }
    setLoading(false)
  }

  const inputStyle = "mt-1 block w-full border border-gray-400 rounded-md p-2 text-black bg-white focus:border-blue-500 outline-none"

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-black">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2 text-center">出張修理 予約登録</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900">依頼者名 / 顧客名</label>
            <input name="customer_name" required className={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">現場住所</label>
            <input name="location" required className={inputStyle} />
          </div>

          {/* 担当作業員（タイムテーブルからの引き継ぎ） */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900">担当作業員</label>
              <input 
                name="worker_name" 
                value={selectedWorker} 
                onChange={(e) => setSelectedWorker(e.target.value)}
                required 
                className={`${inputStyle} bg-gray-50`} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900">開始時間</label>
              <input 
                name="start_time" 
                value={selectedTime} 
                onChange={(e) => setSelectedTime(e.target.value)}
                required 
                className={`${inputStyle} bg-gray-50`} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">訪問予定日</label>
            <input 
              type="date" 
              name="appointment_date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              required 
              className={inputStyle} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">機械の種類 / 故障状況</label>
            <input name="machine_type" placeholder="機械名" required className={inputStyle} />
            <textarea name="issue_description" rows={3} placeholder="症状など" required className={`${inputStyle} mt-2`} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white font-bold py-4 rounded-md shadow-md active:scale-95 transition-all mt-4">
            {loading ? '登録中...' : 'この内容で予約する'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-800 text-sm font-bold">
            ← 戻る
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={<div className="p-10 text-black font-bold text-center">読み込み中...</div>}>
      <RepairFormContent />
    </Suspense>
  )
}
