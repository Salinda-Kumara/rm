'use client'

import { useState } from 'react'
import { updateApplicationStatus } from '@/app/actions/applications'
import styles from '@/app/dashboard/dashboard.module.css'

export function ReviewActions({
  applicationId,
  currentStatus,
  role,
}: {
  applicationId: string
  currentStatus: string
  role: string
}) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  async function handleAction(status: string) {
    setLoading(true)
    const res = await updateApplicationStatus(applicationId, { status, notes })
    setResult(res || null)
    setLoading(false)
  }

  const isApprovedOrRejected = currentStatus === 'APPROVED' || currentStatus === 'REJECTED'

  if (isApprovedOrRejected) {
    return (
      <div className={styles.alertInfo}>
        ℹ️ This application has already been {currentStatus.toLowerCase()}.
      </div>
    )
  }

  // Finance Actions
  if (role === 'FINANCE') {
    if (currentStatus !== 'FINANCE_REVIEW') {
      return (
        <div className={styles.alertInfo}>
          ℹ️ Current status is <strong>{currentStatus.replace('_', ' ')}</strong>. Finance review is only active when status is <strong>Finance Review</strong>.
        </div>
      )
    }

    return (
      <div className={styles.detailCard}>
        <h3 className={styles.detailCardTitle}>⚡ Finance Review Actions</h3>
        {result?.message && (
          <div className={result.success ? styles.alertSuccess : styles.alertError}>
            {result.success ? '✅' : '⚠️'} {result.message}
          </div>
        )}
        <div className={styles.dashFormGroup}>
          <label className={styles.dashFormLabel}>Finance Review Notes / Comments *</label>
          <textarea
            className={styles.dashFormTextarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add comments, required for rejection..."
            required
          />
        </div>
        <div className={styles.actionRow}>
          <button
            onClick={() => handleAction('FINANCE_APPROVED')}
            disabled={loading}
            className={styles.btnSuccess}
          >
            {loading ? 'Processing...' : '✅ Approve Payment'}
          </button>
          <button
            onClick={() => handleAction('FINANCE_REJECTED')}
            disabled={loading || !notes.trim()}
            className={styles.btnDanger}
          >
            {loading ? 'Processing...' : '❌ Reject Payment'}
          </button>
        </div>
      </div>
    )
  }

  // Exam Division Actions (Staff, Registrar, Super Admin)
  const showMarkUnderReview = currentStatus === 'SUBMITTED'
  const showSendToFinance = currentStatus === 'SUBMITTED' || currentStatus === 'UNDER_REVIEW'
  const canApprove = role === 'REGISTRAR' || role === 'SUPER_ADMIN'
  const canReject = role === 'STAFF' || role === 'REGISTRAR' || role === 'SUPER_ADMIN'

  return (
    <div className={styles.detailCard}>
      <h3 className={styles.detailCardTitle}>⚡ Review Actions</h3>

      {result?.message && (
        <div className={result.success ? styles.alertSuccess : styles.alertError}>
          {result.success ? '✅' : '⚠️'} {result.message}
        </div>
      )}

      <div className={styles.dashFormGroup}>
        <label className={styles.dashFormLabel}>
          Notes {canReject ? '(Required for Rejection)' : '(Optional)'}
        </label>
        <textarea
          className={styles.dashFormTextarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add review notes..."
        />
      </div>

      <div className={styles.actionRow} style={{ flexWrap: 'wrap', gap: '8px' }}>
        {showMarkUnderReview && (
          <button
            onClick={() => handleAction('UNDER_REVIEW')}
            disabled={loading}
            className={styles.btnPrimary}
          >
            {loading ? 'Processing...' : '📋 Mark as Under Review'}
          </button>
        )}
        {showSendToFinance && (
          <button
            onClick={() => handleAction('FINANCE_REVIEW')}
            disabled={loading}
            className={styles.btnSecondary}
            style={{ backgroundColor: 'var(--color-purple-500)', color: 'white', borderColor: 'var(--color-purple-600)' }}
          >
            {loading ? 'Processing...' : '💰 Send to Finance Review'}
          </button>
        )}
        {canApprove && (
          <button
            onClick={() => handleAction('APPROVED')}
            disabled={loading}
            className={styles.btnSuccess}
          >
            {loading ? 'Processing...' : '✅ Final Approve'}
          </button>
        )}
        {canReject && (
          <button
            onClick={() => handleAction('REJECTED')}
            disabled={loading || !notes.trim()}
            className={styles.btnDanger}
            title={!notes.trim() ? 'Please provide notes/remarks to reject this application' : ''}
          >
            {loading ? 'Processing...' : role === 'STAFF' ? '❌ Reject Application' : '❌ Final Reject'}
          </button>
        )}
      </div>
    </div>
  )
}
