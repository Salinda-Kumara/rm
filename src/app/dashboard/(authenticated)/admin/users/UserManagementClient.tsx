'use client'

import { useState } from 'react'
import { updateUserRole, createStaffUser } from '@/app/actions/admin'
import styles from '@/app/dashboard/dashboard.module.css'

interface UserData {
  id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
  sabRegistrationNo: string | null
}

export function UserManagementClient({ users }: { users: UserData[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRoleChange(userId: string, newRole: string) {
    const fd = new FormData()
    fd.set('role', newRole)
    fd.set('isActive', 'true')
    const result = await updateUserRole(userId, fd)
    if (result?.success) setMessage('User updated successfully')
    else setMessage(typeof result?.error === 'string' ? result.error : 'Update failed')
  }

  async function handleToggleActive(userId: string, currentActive: boolean) {
    const fd = new FormData()
    fd.set('isActive', String(!currentActive))
    const result = await updateUserRole(userId, fd)
    if (result?.success) setMessage('User status updated')
  }

  async function handleCreate(formData: FormData) {
    const result = await createStaffUser(formData)
    if (result?.success) {
      setMessage('User created successfully')
      setShowCreate(false)
    } else {
      setMessage(typeof result?.error === 'string' ? result.error : 'Creation failed')
    }
  }

  return (
    <>
      {message && <div className={styles.alertSuccess}>✅ {message}</div>}

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button onClick={() => setShowCreate(!showCreate)} className={styles.btnPrimary}>
          {showCreate ? 'Cancel' : '➕ Create Staff/Admin User'}
        </button>
      </div>

      {showCreate && (
        <div className={styles.detailCard} style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className={styles.detailCardTitle}>Create New User</h3>
          <form action={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Full Name *</label>
                <input name="fullName" className={styles.dashFormInput} required />
              </div>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Email *</label>
                <input name="email" type="email" className={styles.dashFormInput} required />
              </div>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Role *</label>
                <select name="role" className={styles.dashFormInput} required>
                  <option value="STAFF">Staff</option>
                  <option value="REGISTRAR">Registrar</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div className={styles.dashFormGroup}>
                <label className={styles.dashFormLabel}>Password *</label>
                <input name="password" type="password" className={styles.dashFormInput} required />
              </div>
            </div>
            <button type="submit" className={styles.btnSuccess}>Create User</button>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>SAB Reg.</th><th>Role</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.sabRegistrationNo || '—'}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={styles.dashFormInput}
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="STAFF">Staff</option>
                    <option value="REGISTRAR">Registrar</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`${styles.badge} ${u.isActive ? styles.badgeApproved : styles.badgeRejected}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleToggleActive(u.id, u.isActive)}
                    className={`${u.isActive ? styles.btnDanger : styles.btnSuccess} ${styles.btnSmall}`}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
