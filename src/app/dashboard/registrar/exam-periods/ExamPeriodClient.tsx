'use client'

import { useState } from 'react'
import { createExamPeriod } from '@/app/actions/admin'
import styles from '../../dashboard.module.css'

interface PeriodData {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export function ExamPeriodClient({ periods }: { periods: PeriodData[] }) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreate(formData: FormData) {
    const result = await createExamPeriod(formData)
    if (result?.success) {
      setMessage('Exam period created successfully')
      setShowForm(false)
    } else {
      setMessage(typeof result?.error === 'string' ? result.error : 'Creation failed')
    }
  }

  return (
    <>
      {message && <div className={styles.alertSuccess}>✅ {message}</div>}

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button onClick={() => setShowForm(!showForm)} className={styles.btnPrimary}>
          {showForm ? 'Cancel' : '➕ Add Exam Period'}
        </button>
      </div>

      {showForm && (
        <div className={styles.detailCard} style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className={styles.detailCardTitle}>Create Exam Period</h3>
          <form action={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Period Name *</label>
                <input name="name" className={styles.dashFormInput} placeholder="e.g., 2024 July Semester" required />
              </div>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Start Date *</label>
                <input name="startDate" type="date" className={styles.dashFormInput} required />
              </div>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>End Date *</label>
                <input name="endDate" type="date" className={styles.dashFormInput} required />
              </div>
            </div>
            <button type="submit" className={styles.btnSuccess}>Create Period</button>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>Period Name</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.startDate}</td>
                <td>{p.endDate}</td>
                <td><span className={`${styles.badge} ${p.isActive ? styles.badgeApproved : styles.badgeRejected}`}>{p.isActive ? 'Active' : 'Closed'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
