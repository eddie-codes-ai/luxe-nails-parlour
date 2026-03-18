// src/app/(public)/booking/cancel/page.tsx
import { Suspense } from 'react'
import CancelClient from './CancelClient'

export const metadata = {
  title: 'Cancel or Reschedule | LuxeNails Parlour',
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <p style={{ color: '#7A6A52', fontSize: 14 }}>Loading your booking...</p>
      </div>
    }>
      <CancelClient />
    </Suspense>
  )
}