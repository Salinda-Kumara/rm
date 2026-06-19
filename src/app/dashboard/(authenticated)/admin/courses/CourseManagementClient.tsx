'use client'

import { useState } from 'react'
import { createCourse, deleteCourse } from '@/app/actions/admin'
import styles from '@/app/dashboard/dashboard.module.css'

interface CourseData {
  id: string
  courseCode: string
  courseTitle: string
  isActive: boolean
}

export function CourseManagementClient({ courses }: { courses: CourseData[] }) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreate(formData: FormData) {
    const result = await createCourse(formData)
    if (result?.success) {
      setMessage('Course created successfully')
      setShowForm(false)
    } else {
      setMessage(typeof result?.error === 'string' ? result.error : 'Creation failed')
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm('Are you sure you want to deactivate this course?')) return
    const result = await deleteCourse(courseId)
    if (result?.success) setMessage('Course deactivated')
  }

  return (
    <>
      {message && <div className={styles.alertSuccess}>✅ {message}</div>}

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button onClick={() => setShowForm(!showForm)} className={styles.btnPrimary}>
          {showForm ? 'Cancel' : '➕ Add Course'}
        </button>
      </div>

      {showForm && (
        <div className={styles.detailCard} style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className={styles.detailCardTitle}>Add New Course</h3>
          <form action={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)' }}>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Course Code *</label>
                <input name="courseCode" className={styles.dashFormInput} placeholder="e.g., ACC1013" required />
              </div>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Course Title *</label>
                <input name="courseTitle" className={styles.dashFormInput} placeholder="e.g., Financial Accounting I" required />
              </div>
            </div>
            <button type="submit" className={styles.btnSuccess}>Add Course</button>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>Code</th><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.courseCode}</strong></td>
                <td>{c.courseTitle}</td>
                <td>
                  <span className={`${styles.badge} ${c.isActive ? styles.badgeApproved : styles.badgeRejected}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {c.isActive && (
                    <button onClick={() => handleDelete(c.id)} className={`${styles.btnDanger} ${styles.btnSmall}`}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
