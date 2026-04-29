// src/app/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function RepairForm() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      alert('エラーが発生しました: ' + error.message)
    } else {
      alert('予約を受け付けました！')
      const form = e.target as HTMLFormElement
      form.reset()
    }
    setLoading(false)
  }

  // 共通の入力スタイル（文字色を黒に指定）
  const inputStyle = "mt-1 block w-full border border-gray-400 rounded-md p-2 text-black bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">出張修理 予約依頼</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-900">依頼者名 / 顧客名</label>
            <input name="customer_name" required className={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">現場住所</label>
            <input name="location" required className={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">機械の種類</label>
            <input name="machine_type" placeholder="例: ユンボ、発電機" required className={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">故障状況</label>
            <textarea name="issue_description" rows={3} required className={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900">訪問希望日</label>
            <input type="date" name="appointment_date" required className={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-400 transition-colors shadow-sm"
          >
            {loading ? '送信中...' : '予約を送信する'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="/admin" className="text-blue-600 hover:underline text-sm font-medium">
            → 予約一覧を確認する（管理者用）
          </a>
        </div>
      </div>
    </div>
  )
}
