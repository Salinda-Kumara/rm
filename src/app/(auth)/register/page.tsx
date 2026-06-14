'use client'

import { useActionState } from 'react'
import { register, type AuthState } from '@/app/actions/auth'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, undefined)

  return (
    <div className={styles.authContainer}>
      <div className={styles.brandSide}>
        <div className={styles.brandLogo}>SAB</div>
        <h1 className={styles.brandTitle}>Exam Portal</h1>
        <p className={styles.brandSubtitle}>
          School of Accounting & Business<br />
          BSc. (Applied Accounting) Degree Programme<br />
          Institute of Chartered Accountants of Sri Lanka
        </p>
        <div className={styles.brandFeatures}>
          <div className={styles.brandFeature}>
            <span className={styles.brandFeatureIcon}>📋</span>
            <span>Apply for Repeat & Medical Examinations online</span>
          </div>
          <div className={styles.brandFeature}>
            <span className={styles.brandFeatureIcon}>🔒</span>
            <span>Secure & encrypted application processing</span>
          </div>
          <div className={styles.brandFeature}>
            <span className={styles.brandFeatureIcon}>⚡</span>
            <span>Track your application status in real-time</span>
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={`${styles.formCard} ${styles.formCardRegister}`}>
          <h2 className={styles.formTitle}>Create Account</h2>
          <p className={styles.formSubtitle}>Register as a student to get started</p>

          {state?.message && (
            <div className={styles.alertError}>
              ⚠️ {state.message}
            </div>
          )}

          <form action={action}>
            <div className={styles.sectionTitle}>Personal Information</div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.formLabel}>Title *</label>
                <select id="title" name="title" className={styles.formSelect} required>
                  <option value="">Select</option>
                  <option value="MR">Mr.</option>
                  <option value="MS">Ms.</option>
                </select>
                {state?.errors?.title && <p className={styles.formError}>{state.errors.title[0]}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="intake" className={styles.formLabel}>Intake *</label>
                <input id="intake" name="intake" placeholder="e.g., 2024 Jan" className={styles.formInput} required />
                {state?.errors?.intake && <p className={styles.formError}>{state.errors.intake[0]}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.formLabel}>Full Name (in BLOCK CAPITALS) *</label>
              <input id="fullName" name="fullName" placeholder="JOHN PERERA" className={styles.formInput} style={{ textTransform: 'uppercase' }} required />
              {state?.errors?.fullName && <p className={styles.formError}>{state.errors.fullName[0]}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nameWithInitials" className={styles.formLabel}>Name with Initials *</label>
              <input id="nameWithInitials" name="nameWithInitials" placeholder="J. Perera" className={styles.formInput} required />
              {state?.errors?.nameWithInitials && <p className={styles.formError}>{state.errors.nameWithInitials[0]}</p>}
            </div>

            <div className={styles.sectionTitle}>Contact Details</div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address *</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" className={styles.formInput} required />
              {state?.errors?.email && <p className={styles.formError}>{state.errors.email[0]}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="permanentAddress" className={styles.formLabel}>Permanent Address *</label>
              <input id="permanentAddress" name="permanentAddress" placeholder="No. 123, Main Street, Colombo 07" className={styles.formInput} required />
              {state?.errors?.permanentAddress && <p className={styles.formError}>{state.errors.permanentAddress[0]}</p>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phoneHome" className={styles.formLabel}>Home Phone</label>
                <input id="phoneHome" name="phoneHome" placeholder="011-2345678" className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phoneMobile" className={styles.formLabel}>Mobile *</label>
                <input id="phoneMobile" name="phoneMobile" placeholder="077-1234567" className={styles.formInput} required />
                {state?.errors?.phoneMobile && <p className={styles.formError}>{state.errors.phoneMobile[0]}</p>}
              </div>
            </div>

            <div className={styles.sectionTitle}>Registration Details</div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="nicPassportNo" className={styles.formLabel}>NIC / Passport No. *</label>
                <input id="nicPassportNo" name="nicPassportNo" placeholder="200012345678" className={styles.formInput} required />
                {state?.errors?.nicPassportNo && <p className={styles.formError}>{state.errors.nicPassportNo[0]}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="sabRegistrationNo" className={styles.formLabel}>SAB Registration No. *</label>
                <input id="sabRegistrationNo" name="sabRegistrationNo" placeholder="SAB/2024/001" className={styles.formInput} required />
                {state?.errors?.sabRegistrationNo && <p className={styles.formError}>{state.errors.sabRegistrationNo[0]}</p>}
              </div>
            </div>

            <div className={styles.sectionTitle}>Account Security</div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password *</label>
              <input id="password" name="password" type="password" placeholder="Create a strong password" className={styles.formInput} required />
              <p className={styles.passwordHint}>Min 8 chars, include letter, number & special character</p>
              {state?.errors?.password && (
                <div>
                  {state.errors.password.map((err) => (
                    <p key={err} className={styles.formError}>{err}</p>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password *</label>
              <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" className={styles.formInput} required />
              {state?.errors?.confirmPassword && <p className={styles.formError}>{state.errors.confirmPassword[0]}</p>}
            </div>

            <button type="submit" disabled={pending} className={styles.submitBtn}>
              {pending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={styles.formFooter}>
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
