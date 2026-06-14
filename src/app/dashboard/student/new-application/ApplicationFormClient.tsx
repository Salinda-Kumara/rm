'use client'

import { useState, useActionState, startTransition } from 'react'
import { createApplication, type ApplicationState } from '@/app/actions/applications'
import styles from '../../dashboard.module.css'
import formStyles from './form.module.css'

interface Course {
  id: string
  courseCode: string
  courseTitle: string
}

interface ExamPeriod {
  id: string
  name: string
}

interface SubjectRow {
  courseId: string
  category: 'MEDICAL' | 'REPEAT' | 'FIRST_ATTEMPT'
  caMarks: number | null
  upcomingExamDate: string
  upcomingExamIntake: string
}

interface MedicalDetailRow {
  courseCode: string
  courseTitle: string
  examDate: string
  intakeDetails: string
}

interface RepeatDetailRow {
  courseCode: string
  courseTitle: string
  examDate: string
  intakeDetails: string
  gradeEarned: string
  examDivConfirmation: boolean
}

const MEDICAL_FEE = 5200
const REPEAT_FEE = 2600

export default function ApplicationFormClient({
  courses,
  examPeriods,
}: {
  courses: Course[]
  examPeriods: ExamPeriod[]
}) {
  const [step, setStep] = useState(1)
  const [examPeriodId, setExamPeriodId] = useState('')
  const [subjects, setSubjects] = useState<SubjectRow[]>([
    { courseId: '', category: 'REPEAT', caMarks: null, upcomingExamDate: '', upcomingExamIntake: '' },
  ])
  const [medicalDetails, setMedicalDetails] = useState<MedicalDetailRow[]>([])
  const [repeatDetails, setRepeatDetails] = useState<RepeatDetailRow[]>([])
  const [paymentReference, setPaymentReference] = useState('')
  const [declaration, setDeclaration] = useState(false)
  const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null)
  const [medicalCertFile, setMedicalCertFile] = useState<File | null>(null)

  const [state, action, pending] = useActionState<ApplicationState, FormData>(createApplication, undefined)

  const totalSteps = 4
  const hasMedical = subjects.some((s) => s.category === 'MEDICAL')
  const hasRepeat = subjects.some((s) => s.category === 'REPEAT')

  // Calculate fee
  const totalFee = subjects.reduce((sum, s) => {
    if (s.category === 'MEDICAL') return sum + MEDICAL_FEE
    if (s.category === 'REPEAT') return sum + REPEAT_FEE
    return sum
  }, 0)

  function addSubject() {
    setSubjects([...subjects, { courseId: '', category: 'REPEAT', caMarks: null, upcomingExamDate: '', upcomingExamIntake: '' }])
  }

  function removeSubject(index: number) {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index))
    }
  }

  function updateSubject(index: number, field: keyof SubjectRow, value: string | number | null) {
    const updated = [...subjects]
    updated[index] = { ...updated[index], [field]: value }
    setSubjects(updated)
  }

  function addMedicalDetail() {
    setMedicalDetails([...medicalDetails, { courseCode: '', courseTitle: '', examDate: '', intakeDetails: '' }])
  }

  function removeMedicalDetail(index: number) {
    setMedicalDetails(medicalDetails.filter((_, i) => i !== index))
  }

  function addRepeatDetail() {
    setRepeatDetails([...repeatDetails, { courseCode: '', courseTitle: '', examDate: '', intakeDetails: '', gradeEarned: '', examDivConfirmation: false }])
  }

  function removeRepeatDetail(index: number) {
    setRepeatDetails(repeatDetails.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    const formData = new FormData()
    formData.set('applicationData', JSON.stringify({
      examPeriodId: examPeriodId || null,
      subjects,
      medicalDetails: hasMedical ? medicalDetails : [],
      repeatDetails: hasRepeat ? repeatDetails : [],
      paymentReference,
      declarationAccepted: declaration,
    }))
    if (paymentSlipFile) {
      formData.append('paymentSlip', paymentSlipFile)
    }
    if (medicalCertFile) {
      formData.append('medicalCert', medicalCertFile)
    }
    startTransition(() => {
      action(formData)
    })
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>New Application</h1>
          <p className={styles.pageSubtitle}>Apply for Repeat / Medical End Semester Examination</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={formStyles.progressBar}>
        {['Subjects', 'Previous Exams', 'Payment & Upload', 'Review & Submit'].map((label, i) => (
          <div key={label} className={`${formStyles.progressStep} ${i + 1 <= step ? formStyles.progressStepActive : ''} ${i + 1 < step ? formStyles.progressStepDone : ''}`}>
            <div className={formStyles.progressDot}>{i + 1 < step ? '✓' : i + 1}</div>
            <span className={formStyles.progressLabel}>{label}</span>
          </div>
        ))}
      </div>

      {state?.message && (
        <div className={styles.alertError}>⚠️ {state.message}</div>
      )}

      {state?.errors && (
        <div className={styles.alertError}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>⚠️ Please correct the following errors:</strong>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {Object.entries(state.errors).map(([field, messages]) => (
              <li key={field} style={{ marginBottom: '4px' }}>
                <span style={{ textTransform: 'capitalize' }}>{field}</span>: {messages.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Subjects */}
      {step === 1 && (
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>📚 Subjects Applied For</h3>

          {examPeriods.length > 0 && (
            <div className={styles.dashFormGroup}>
              <label className={styles.dashFormLabel}>Exam Period</label>
              <select className={styles.dashFormInput} value={examPeriodId} onChange={(e) => setExamPeriodId(e.target.value)}>
                <option value="">Select exam period (optional)</option>
                {examPeriods.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.name}</option>
                ))}
              </select>
            </div>
          )}

          {subjects.map((subject, index) => (
            <div key={index} className={formStyles.subjectRow}>
              <div className={formStyles.subjectRowHeader}>
                <span className={formStyles.subjectNumber}>Subject {index + 1}</span>
                {subjects.length > 1 && (
                  <button type="button" onClick={() => removeSubject(index)} className={formStyles.removeBtn}>✕</button>
                )}
              </div>
              <div className={formStyles.subjectFields}>
                <div className={styles.dashFormGroup}>
                  <label className={styles.dashFormLabel}>Course *</label>
                  <select className={styles.dashFormInput} value={subject.courseId} onChange={(e) => updateSubject(index, 'courseId', e.target.value)} required>
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.courseCode} — {c.courseTitle}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.dashFormGroup}>
                  <label className={styles.dashFormLabel}>Category *</label>
                  <select className={styles.dashFormInput} value={subject.category} onChange={(e) => updateSubject(index, 'category', e.target.value)}>
                    <option value="MEDICAL">Medical</option>
                    <option value="REPEAT">Repeat</option>
                    <option value="FIRST_ATTEMPT">1st Attempt</option>
                  </select>
                </div>
                <div className={styles.dashFormGroup}>
                  <label className={styles.dashFormLabel}>CA Marks</label>
                  <input type="number" min="0" max="100" className={styles.dashFormInput} placeholder="e.g., 45" value={subject.caMarks ?? ''} onChange={(e) => updateSubject(index, 'caMarks', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className={styles.dashFormGroup}>
                  <label className={styles.dashFormLabel}>Upcoming Exam Intake</label>
                  <input type="text" className={styles.dashFormInput} placeholder="e.g., 2024 July" value={subject.upcomingExamIntake} onChange={(e) => updateSubject(index, 'upcomingExamIntake', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addSubject} className={formStyles.addBtn}>
            + Add Another Subject
          </button>

          <div className={formStyles.feeBox}>
            <span>Estimated Total Fee:</span>
            <strong>LKR {totalFee.toLocaleString()}</strong>
          </div>
        </div>
      )}

      {/* Step 2: Previous Exam Details */}
      {step === 2 && (
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>📋 Previous Examination Details</h3>

          {hasMedical && (
            <>
              <h4 className={formStyles.subSectionTitle}>Medical Exam Details</h4>
              {medicalDetails.map((detail, index) => (
                <div key={index} className={formStyles.subjectRow}>
                  <div className={formStyles.subjectRowHeader}>
                    <span className={formStyles.subjectNumber}>Medical #{index + 1}</span>
                    <button type="button" onClick={() => removeMedicalDetail(index)} className={formStyles.removeBtn}>✕</button>
                  </div>
                  <div className={formStyles.subjectFields}>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Course Code</label>
                      <input className={styles.dashFormInput} value={detail.courseCode} onChange={(e) => {
                        const updated = [...medicalDetails]; updated[index] = { ...updated[index], courseCode: e.target.value }; setMedicalDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Course Title</label>
                      <input className={styles.dashFormInput} value={detail.courseTitle} onChange={(e) => {
                        const updated = [...medicalDetails]; updated[index] = { ...updated[index], courseTitle: e.target.value }; setMedicalDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Date of Exam</label>
                      <input type="date" className={styles.dashFormInput} value={detail.examDate} onChange={(e) => {
                        const updated = [...medicalDetails]; updated[index] = { ...updated[index], examDate: e.target.value }; setMedicalDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Intake Details</label>
                      <input className={styles.dashFormInput} value={detail.intakeDetails} onChange={(e) => {
                        const updated = [...medicalDetails]; updated[index] = { ...updated[index], intakeDetails: e.target.value }; setMedicalDetails(updated)
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addMedicalDetail} className={formStyles.addBtn}>+ Add Medical Detail</button>
            </>
          )}

          {hasRepeat && (
            <>
              <h4 className={formStyles.subSectionTitle}>Repeat Exam Details</h4>
              {repeatDetails.map((detail, index) => (
                <div key={index} className={formStyles.subjectRow}>
                  <div className={formStyles.subjectRowHeader}>
                    <span className={formStyles.subjectNumber}>Repeat #{index + 1}</span>
                    <button type="button" onClick={() => removeRepeatDetail(index)} className={formStyles.removeBtn}>✕</button>
                  </div>
                  <div className={formStyles.subjectFields}>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Course Code</label>
                      <input className={styles.dashFormInput} value={detail.courseCode} onChange={(e) => {
                        const updated = [...repeatDetails]; updated[index] = { ...updated[index], courseCode: e.target.value }; setRepeatDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Course Title</label>
                      <input className={styles.dashFormInput} value={detail.courseTitle} onChange={(e) => {
                        const updated = [...repeatDetails]; updated[index] = { ...updated[index], courseTitle: e.target.value }; setRepeatDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Date of Exam</label>
                      <input type="date" className={styles.dashFormInput} value={detail.examDate} onChange={(e) => {
                        const updated = [...repeatDetails]; updated[index] = { ...updated[index], examDate: e.target.value }; setRepeatDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Intake Details</label>
                      <input className={styles.dashFormInput} value={detail.intakeDetails} onChange={(e) => {
                        const updated = [...repeatDetails]; updated[index] = { ...updated[index], intakeDetails: e.target.value }; setRepeatDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>Grade Earned</label>
                      <input className={styles.dashFormInput} value={detail.gradeEarned} onChange={(e) => {
                        const updated = [...repeatDetails]; updated[index] = { ...updated[index], gradeEarned: e.target.value }; setRepeatDetails(updated)
                      }} />
                    </div>
                    <div className={styles.dashFormGroup}>
                      <label className={styles.dashFormLabel}>
                        <input type="checkbox" checked={detail.examDivConfirmation} onChange={(e) => {
                          const updated = [...repeatDetails]; updated[index] = { ...updated[index], examDivConfirmation: e.target.checked }; setRepeatDetails(updated)
                        }} style={{ marginRight: '8px' }} />
                        Confirmation from Exam Division
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addRepeatDetail} className={formStyles.addBtn}>+ Add Repeat Detail</button>
            </>
          )}

          {!hasMedical && !hasRepeat && (
            <div className={styles.alertInfo}>ℹ️ No Medical or Repeat subjects selected. You can skip this step.</div>
          )}
        </div>
      )}

      {/* Step 3: Payment & Upload */}
      {step === 3 && (
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>💳 Payment Details</h3>

          <div className={styles.alertInfo}>
            ℹ️ <strong>Bank Details:</strong> The Institute of Chartered Accountants of Sri Lanka - SAB | Sampath Bank, Borella | A/C: 000460002370
          </div>

          <div className={formStyles.feeBox}>
            <span>Total Fee:</span>
            <strong>LKR {totalFee.toLocaleString()}</strong>
          </div>

          <div className={formStyles.feeBreakdown}>
            {subjects.map((s, i) => {
              const course = courses.find((c) => c.id === s.courseId)
              const fee = s.category === 'MEDICAL' ? MEDICAL_FEE : s.category === 'REPEAT' ? REPEAT_FEE : 0
              return (
                <div key={i} className={formStyles.feeRow}>
                  <span>{course ? `${course.courseCode} — ${course.courseTitle}` : 'Unknown Course'}</span>
                  <span>{s.category} — LKR {fee.toLocaleString()}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.dashFormGroup}>
            <label className={styles.dashFormLabel}>Payment Reference / Receipt Number *</label>
            <input
              className={styles.dashFormInput}
              placeholder="Enter your payment reference or receipt number"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              required
            />
          </div>

          <div className={styles.dashFormGroup}>
            <label className={styles.dashFormLabel}>Payment Slip (Upload)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className={styles.dashFormInput}
              onChange={(e) => setPaymentSlipFile(e.target.files?.[0] || null)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginTop: '4px' }}>
              Accepted: PDF, JPG, PNG (max 5MB)
            </p>
          </div>

          {hasMedical && (
            <div className={styles.dashFormGroup}>
              <label className={styles.dashFormLabel}>Medical Certificate (Upload)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={styles.dashFormInput}
                onChange={(e) => setMedicalCertFile(e.target.files?.[0] || null)}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginTop: '4px' }}>
                Required for medical applications. Accepted: PDF, JPG, PNG (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className={styles.detailCard}>
          <h3 className={styles.detailCardTitle}>✅ Review & Submit</h3>

          <div className={formStyles.reviewSection}>
            <h4>Subjects ({subjects.length})</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>CA Marks</th>
                  <th>Fee (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => {
                  const course = courses.find((c) => c.id === s.courseId)
                  return (
                    <tr key={i}>
                      <td>{course ? `${course.courseCode} — ${course.courseTitle}` : '—'}</td>
                      <td>{s.category}</td>
                      <td>{s.caMarks ?? '—'}</td>
                      <td>{s.category === 'MEDICAL' ? MEDICAL_FEE.toLocaleString() : s.category === 'REPEAT' ? REPEAT_FEE.toLocaleString() : '0'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className={formStyles.feeBox} style={{ marginTop: 'var(--space-4)' }}>
            <span>Total Fee:</span>
            <strong>LKR {totalFee.toLocaleString()}</strong>
          </div>

          <div className={formStyles.declarationBox}>
            <label className={formStyles.declarationLabel}>
              <input
                type="checkbox"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
                className={formStyles.declarationCheck}
              />
              <span>
                I certify that the particulars disclosed above are true and accurate.
                I understand that any false information may result in cancellation of my application.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={formStyles.formNav}>
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className={styles.btnSecondary}>
            ← Previous
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < totalSteps && (
          <button type="button" onClick={() => setStep(step + 1)} className={styles.btnPrimary}>
            Next →
          </button>
        )}
        {step === totalSteps && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!declaration || pending}
            className={styles.btnSuccess}
          >
            {pending ? 'Submitting...' : '📤 Submit Application'}
          </button>
        )}
      </div>
    </div>
  )
}
