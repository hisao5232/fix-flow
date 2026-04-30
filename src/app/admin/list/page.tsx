'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 型定義
type RepairRequest = {
  id: string
  customer_name: string
  location: string
  machine_type: string
  issue_description: string
  appointment_date: string
  status: string
  created_at: string
}

export default function AdminListPage() {
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      // 1. ログインチェック
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email ?? 'ログイン中')

      // 2. 予約データの取得（訪問日の近い順）
      const { data, error } = await supabase
        .from('repair_requests')
        .select('*')
        .order('appointment_date', { ascending: true })

      if (error) {
        console.error('データ取得エラー:', error.message)
      } else {
        setRequests(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  if (loading) return <div className="p-10 text-black font-bold text-center">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:underline text-sm font-bold">
              ← カレンダー
            </Link>
            <h1 className="text-xl font-bold text-gray-900">予約データ一覧</h1>
          </div>
          <div className="text-sm font-bold text-gray-600 hidden sm:block">
            👤 {userEmail}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">訪問予定日</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">顧客名 / 現場住所</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">機械 / 故障内容</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">状態</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">
                        {req.appointment_date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{req.customer_name}</div>
                        <div className="text-xs text-gray-500">{req.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">{req.machine_type}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{req.issue_description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          req.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {req.status === 'pending' ? '未対応' : '完了'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {requests.length === 0 && (
              <div className="p-20 text-center text-gray-500 font-bold">
                現在、登録されている予約はありません。
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href="/form" className="inline-block bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-md hover:bg-blue-800 transition-all">
              ＋ 新規予約を登録する
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
