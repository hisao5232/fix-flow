// src/app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type RepairRequest = {
  id: string
  customer_name: string
  location: string
  machine_type: string
  issue_description: string
  appointment_date: string
  status: string
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from('repair_requests')
        .select('*')
        .order('appointment_date', { ascending: true })

      if (error) {
        console.error(error)
      } else {
        setRequests(data || [])
      }
      setLoading(false)
    }

    fetchRequests()
  }, [])

  if (loading) return <div className="p-10 text-black">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">修理予約 一覧</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">訪問日</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">顧客・場所</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">機械・内容</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">状態</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{req.appointment_date}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{req.customer_name}</div>
                    <div className="text-xs text-gray-600">{req.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-blue-800">{req.machine_type}</div>
                    <div className="text-xs text-gray-700 line-clamp-2">{req.issue_description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {req.status === 'pending' ? '未対応' : req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && (
            <div className="p-10 text-center text-gray-500">予約データがありません</div>
          )}
        </div>
        
        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:underline text-sm">← 予約フォームに戻る</a>
        </div>
      </div>
    </div>
  )
}
