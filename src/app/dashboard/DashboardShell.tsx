'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import styles from './dashboard.module.css'

interface DashboardShellProps {
  session: {
    userId: string
    role: string
    fullName: string
    email: string
  }
  children: React.ReactNode
}

export function DashboardShell({ session, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Prevent body scroll when sidebar overlay is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        session={session}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={styles.mainContent}>
        {/* Mobile header with hamburger */}
        <div className={styles.mobileHeader}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className={styles.mobileHeaderBrand}>
            <span className={styles.mobileHeaderLogo}>SAB</span>
            <span className={styles.mobileHeaderTitle}>Exam Portal</span>
          </div>
          <div style={{ width: '40px' }} /> {/* Spacer for center alignment */}
        </div>
        {children}
      </main>
    </div>
  )
}
