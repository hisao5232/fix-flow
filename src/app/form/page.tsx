// src/app/form/page.tsx
'use client'

import { useState, useEffect, Suspense, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation' // useRouterを追加

function RepairFormContent() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const dateQuery = searchParams.get('date')
    if (dateQuery) setSelectedDate(dateQuery)
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
    }

    const { error } = await supabase.from('repair_requests').insert([data])

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('予約を登録しました！')
      router.push('/') // 送信完了後、カレンダー画面へ戻る
    }
    setLoading(false)
  }

  const inputStyle = "mt-1 block w-full border border-gray-400 rounded-md p-2 text-black bg-white focus:border-blue-500 outline-none transition-all"

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2 text-center">出張修理 予約登録</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ...中身は以前と同じ（省略）... */}
          <div>
            <label className="block text-sm font-bold text-gray-900">訪問希望日</label>
            <input type="date" name="appointment_date" required value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputStyle} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white font-bold py-4 rounded-md shadow-md active:scale-95 transition-all">
            {loading ? '送信中...' : '予約を登録する'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-900 text-sm font-bold underline">
            ← 登録せずにカレンダーに戻る
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
