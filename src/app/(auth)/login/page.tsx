'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '@/app/actions/auth'
import styles from '../auth.module.css'

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined)

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
          <div className={styles.brandFeature}>
            <span className={styles.brandFeatureIcon}>✅</span>
            <span>Quick approval workflow</span>
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Welcome Back</h2>
          <p className={styles.formSubtitle}>Sign in to your account to continue</p>

          {state?.message && (
            <div className={styles.alertError}>
              ⚠️ {state.message}
            </div>
          )}

          <form action={action}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={styles.formInput}
                required
              />
              {state?.errors?.email && (
                <p className={styles.formError}>{state.errors.email[0]}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className={styles.formInput}
                required
              />
              {state?.errors?.password && (
                <p className={styles.formError}>{state.errors.password[0]}</p>
              )}
            </div>

            <button type="submit" disabled={pending} className={styles.submitBtn}>
              {pending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className={styles.formFooter}>
            Are you a student?{' '}
            <a href="/new-application" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>Apply for Exams here</a>
          </p>
        </div>
      </div>
    </div>
  )
}
