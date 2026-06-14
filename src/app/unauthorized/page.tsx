import Link from 'next/link'
import styles from '../dashboard/dashboard.module.css'

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-gray-50)',
    }}>
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-10)',
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '400px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔒</div>
        <h1 className={styles.pageTitle}>Access Denied</h1>
        <p style={{
          color: 'var(--color-gray-500)',
          marginTop: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
        }}>
          You do not have permission to access this page.
        </p>
        <Link href="/" className={styles.btnPrimary}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
