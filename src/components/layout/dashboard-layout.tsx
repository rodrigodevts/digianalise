'use client'

import { Sidebar } from './sidebar'
import { AssistantPopup } from '../assistant-popup'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
      <AssistantPopup />
    </div>
  )
}