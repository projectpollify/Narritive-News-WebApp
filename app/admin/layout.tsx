import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Narrative News',
  description: 'Monitor and manage your Narrative News platform',
  robots: 'noindex, nofollow' // Prevent search engine indexing of admin pages
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-dashboard">
      {/* Simple auth check (in production, implement proper authentication) */}
      <div className="bg-yellow-50 border-b border-yellow-200 p-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-yellow-800 text-sm text-center">
            ⚠️ <strong>Admin Area</strong> - In production, implement proper authentication for this section
          </p>
        </div>
      </div>
      
      {children}
    </div>
  )
}