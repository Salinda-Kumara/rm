import { requireRole } from '@/lib/session'
import { getApplicationById } from '@/app/actions/applications'
import { notFound } from 'next/navigation'
import styles from './print.module.css'
import { PrintPageActions } from './PrintPageActions'
import { PdfAttachmentRenderer } from './PdfAttachmentRenderer'

const isImage = (filePath: string) => {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')
}

export default async function PrintApplicationPage(props: { params: Promise<{ id: string }> }) {
  // Access control: only Staff and Registrar can print
  await requireRole(['STAFF', 'REGISTRAR'])
  const { id } = await props.params
  const application = await getApplicationById(id)

  if (!application) {
    notFound()
  }

  const user = application.user
  const subjects = application.subjects
  const medicalDetails = application.medicalDetails
  const repeatDetails = application.repeatDetails

  // NIC char array
  const nic = user.nicPassportNo || ''
  const nicChars = nic.padEnd(12, ' ').substring(0, 12).split('')

  // Title formatting
  const titlePrefix = user.title === 'MR' ? 'Mr.' : user.title === 'MS' ? 'Ms.' : ''
  const nameWithTitle = titlePrefix ? `${titlePrefix} ${user.nameWithInitials}` : user.nameWithInitials

  return (
    <div className={styles.printWrapper}>
      <PrintPageActions />

      {/* Header section matching PDF */}
      <div className={styles.headerContainer}>
        <div className={styles.logoArea}>
          <div className={styles.caLogo}>
            <span className={styles.caText}>CA</span>
            <span className={styles.caSubText}>SAB Campus</span>
          </div>
          <svg className={styles.crestLogo} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
        </div>

        <div className={styles.headerText}>
          <h1 className={styles.titlePrimary}>BSc. (Applied Accounting) General/Special Degree Programme</h1>
          <p className={styles.titleSecondary}>School of Accounting and Business, No. 30A, Malalasekara Mawatha, Colombo 07.</p>
          <p className={styles.titleTertiary}>Tel: 011-2352077 Fax: 011-2352060</p>
          <div className={styles.examTitle}>
            APPLICATION FOR THE END SEMESTER EXAMINATION — {application.examPeriod?.name || '………………………………………'}
          </div>
          <div className={styles.subTitle}>REPEAT / MEDICAL APPLICATION</div>
        </div>
      </div>

      {/* Bank Details Table */}
      <table className={styles.bankTable}>
        <thead>
          <tr>
            <th>Bank Account Name</th>
            <th>Bank</th>
            <th>Branch</th>
            <th>Account No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>The Institute of Chartered Accountants of Sri Lanka- SAB</td>
            <td>Sampath Bank</td>
            <td>Borella</td>
            <td>000460002370</td>
          </tr>
        </tbody>
      </table>

      {/* Personal Information section */}
      <div>
        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}>1.</span>
            <span className={styles.labelText}>i Full Name (in BLOCK LETTERS)</span>
          </div>
          <div className={styles.rowValue} style={{ textTransform: 'uppercase' }}>
            {user.fullName}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}></span>
            <span className={styles.labelText}>ii Name with Initials (Mr./Ms.)</span>
          </div>
          <div className={styles.rowValue}>
            {nameWithTitle}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}>2.</span>
            <span className={styles.labelText}>i Permanent Address</span>
          </div>
          <div className={styles.rowValue}>
            {user.permanentAddress}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}></span>
            <span className={styles.labelText}>ii Postal Address (if different)</span>
          </div>
          <div className={styles.rowValue}>
            {user.postalAddress || '—'}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}></span>
            <span className={styles.labelText}>iii Contact Telephone Numbers</span>
          </div>
          <div className={styles.telephoneGrid}>
            <div className={styles.telItem}>
              <span className={styles.telLabel}>Home:</span>
              <span className={styles.telValue}>{user.phoneHome || '—'}</span>
            </div>
            <div className={styles.telItem}>
              <span className={styles.telLabel}>Mobile:</span>
              <span className={styles.telValue}>{user.phoneMobile || '—'}</span>
            </div>
            <div className={styles.telItem}>
              <span className={styles.telLabel}>Email:</span>
              <span className={styles.telValue}>{user.email}</span>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}>3.</span>
            <span className={styles.labelText}>NIC No. / Passport No.</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className={styles.boxGrid}>
              {nicChars.map((char, index) => (
                <div key={index} className={styles.charBox}>
                  {char}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 500, marginRight: '8px' }}>Date of Issue:</span>
              <span style={{ borderBottom: '1px dashed #000', flex: 1, minHeight: '18px' }}></span>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.rowLabel}>
            <span className={styles.labelNum}>4.</span>
            <span className={styles.labelText}>SAB Registration Number</span>
          </div>
          <div style={{ display: 'flex', flex: 1, gap: '24px' }}>
            <span className={styles.rowValue}>{user.sabRegistrationNo}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', width: '250px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, marginRight: '8px' }}>Intake:</span>
              <span className={styles.rowValue} style={{ borderBottom: '1px dashed #000' }}>{user.intake || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Applied Table */}
      <h3 className={styles.tableTitle}>
        5. Subjects applied for: Please write the correct course code, the title of each course and CA completed or not for each course you wish to apply.
      </h3>
      <table className={styles.appTable}>
        <thead>
          <tr>
            <th style={{ width: '100px' }}>Course code</th>
            <th>Course title</th>
            <th style={{ width: '120px' }}>Category (Medical/Repeat)</th>
            <th style={{ width: '120px' }} className={styles.centerCol}>CA Marks (Mandatory)</th>
            <th style={{ width: '80px' }} className={styles.centerCol}>Intake</th>
            <th style={{ width: '120px' }} className={styles.centerCol}>Upcoming Exam Date</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub) => {
            const examDateStr = sub.upcomingExamDate
              ? new Date(sub.upcomingExamDate).toLocaleDateString('en-GB').replace(/\//g, '')
              : ''
            const examDateChars = examDateStr.padEnd(8, ' ').substring(0, 8).split('')

            return (
              <tr key={sub.id}>
                <td>{sub.course.courseCode}</td>
                <td>{sub.course.courseTitle}</td>
                <td>{sub.category === 'MEDICAL' ? 'Medical' : sub.category === 'REPEAT' ? 'Repeat' : 'First Attempt'}</td>
                <td className={styles.centerCol}>{sub.caMarks !== null ? sub.caMarks.toString() : '—'}</td>
                <td className={styles.centerCol}>{sub.upcomingExamIntake || '—'}</td>
                <td className={styles.centerCol}>
                  <div className={styles.dateBoxContainer}>
                    <div className={styles.boxGrid}>
                      {examDateChars.map((char, index) => (
                        <div key={index} className={styles.charBox} style={{ width: '11px', height: '14px', fontSize: '9px' }}>
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )
          })}
          {subjects.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.centerCol}>No subjects applied for.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Previous Exam details */}
      <h3 className={styles.tableTitle}>6. Previous Examination Details;</h3>

      {/* Medical table */}
      <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>If Medical</div>
      <table className={styles.appTable}>
        <thead>
          <tr>
            <th style={{ width: '120px' }}>Course code</th>
            <th>Course title</th>
            <th style={{ width: '150px' }}>Date of the exam</th>
            <th style={{ width: '150px' }}>Intake details</th>
          </tr>
        </thead>
        <tbody>
          {medicalDetails.map((med) => (
            <tr key={med.id}>
              <td>{med.courseCode}</td>
              <td>{med.courseTitle}</td>
              <td>{med.examDate ? new Date(med.examDate).toLocaleDateString() : '—'}</td>
              <td>{med.intakeDetails || '—'}</td>
            </tr>
          ))}
          {medicalDetails.length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No previous medical details recorded.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Repeat table */}
      <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>If Repeat Exam</div>
      <table className={styles.appTable}>
        <thead>
          <tr>
            <th style={{ width: '100px' }}>Course code</th>
            <th>Course title</th>
            <th style={{ width: '120px' }}>Date of the exam</th>
            <th style={{ width: '120px' }}>Intake details</th>
            <th style={{ width: '80px' }} className={styles.centerCol}>Grade Earned</th>
            <th style={{ width: '120px' }} className={styles.centerCol}>Confirmation from Exam Div</th>
          </tr>
        </thead>
        <tbody>
          {repeatDetails.map((rep) => (
            <tr key={rep.id}>
              <td>{rep.courseCode}</td>
              <td>{rep.courseTitle}</td>
              <td>{rep.examDate ? new Date(rep.examDate).toLocaleDateString() : '—'}</td>
              <td>{rep.intakeDetails || '—'}</td>
              <td className={styles.centerCol}>{rep.gradeEarned || '—'}</td>
              <td className={styles.centerCol}>{rep.examDivConfirmation ? '✓ Confirmed' : '—'}</td>
            </tr>
          ))}
          {repeatDetails.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No previous repeat details recorded.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Note box matching PDF */}
      <div className={styles.noteBox}>
        <p>* Re-sit examination fee on medical ground LKR. 5,000/= per course/subject</p>
        <p>* Repeat / Re- Repeat examination fee LKR. 2,500/= per course/subject</p>
        <p style={{ marginTop: '8px', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
          Payment Reference: <strong>{application.paymentReference || '—'}</strong> | Total Fee Paid: <strong>LKR {application.totalFee?.toLocaleString() || '0'}</strong>
        </p>
      </div>

      {/* Declaration */}
      <div className={styles.declarationText}>
        I Certify that the particulars disclosed above are true and accurate.
      </div>

      <div className={styles.signatureGrid}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: '1px dashed #000', width: '180px', minHeight: '18px', fontWeight: 600 }}>
            {application.declaredAt ? new Date(application.declaredAt).toLocaleDateString() : '—'}
          </div>
          <span style={{ fontSize: '11px', marginTop: '4px' }}>Date</span>
        </div>
        <div className={styles.sigLine} style={{ alignSelf: 'flex-end' }}>
          Signature of the Applicant
        </div>
      </div>

      {/* Office Use Section */}
      <div className={styles.officeUseContainer}>
        <h4 className={styles.officeUseTitle}>For Office Use Only</h4>
        <div className={styles.officeUseNote}>
          Eligibility to sit for the End Semester Examination (Medical/Repeat):
          <span style={{ borderBottom: '1px dashed #000', display: 'inline-block', width: '300px', marginLeft: '12px', minHeight: '18px', verticalAlign: 'bottom' }}>
            {application.status === 'APPROVED' ? 'Eligible' : application.status === 'REJECTED' ? 'Not Eligible' : ''}
          </span>
        </div>
        <div className={styles.signatureGrid} style={{ marginTop: '24px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px dashed #000', width: '180px', minHeight: '18px', fontWeight: 600 }}>
              {application.approvedAt ? new Date(application.approvedAt).toLocaleDateString() : '—'}
            </div>
            <span style={{ fontSize: '11px', marginTop: '4px' }}>Date</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ borderBottom: '1px dashed #000', width: '220px', minHeight: '18px', fontWeight: 600, textAlign: 'center' }}>
              {application.approvedBy?.fullName || '—'}
            </div>
            <span style={{ fontSize: '11px', marginTop: '4px' }}>Approved by Assistant Registrar - Exams</span>
          </div>
        </div>
      </div>

      {/* Payment Slip Attachment */}
      {application.paymentSlipPath && (
        <div className={styles.attachmentSection}>
          {isImage(application.paymentSlipPath) ? (
            <>
              <h4 className={styles.attachmentTitle}>📄 Attachment: Payment Slip</h4>
              <div className={styles.attachmentContent}>
                <img src={`/uploads/${application.paymentSlipPath}`} alt="Payment Slip" className={styles.attachmentImage} />
              </div>
              <p className={styles.attachmentHelpText}>
                If this document does not render correctly, you can access it directly at{' '}
                <a href={`/uploads/${application.paymentSlipPath}`} target="_blank" rel="noopener noreferrer">
                  /uploads/{application.paymentSlipPath}
                </a>
              </p>
            </>
          ) : (
            <PdfAttachmentRenderer filePath={application.paymentSlipPath} title="Attachment: Payment Slip" />
          )}
        </div>
      )}

      {/* Medical Certificate Attachment */}
      {application.medicalCertPath && (
        <div className={styles.attachmentSection}>
          {isImage(application.medicalCertPath) ? (
            <>
              <h4 className={styles.attachmentTitle}>🏥 Attachment: Medical Certificate</h4>
              <div className={styles.attachmentContent}>
                <img src={`/uploads/${application.medicalCertPath}`} alt="Medical Certificate" className={styles.attachmentImage} />
              </div>
              <p className={styles.attachmentHelpText}>
                If this document does not render correctly, you can access it directly at{' '}
                <a href={`/uploads/${application.medicalCertPath}`} target="_blank" rel="noopener noreferrer">
                  /uploads/{application.medicalCertPath}
                </a>
              </p>
            </>
          ) : (
            <PdfAttachmentRenderer filePath={application.medicalCertPath} title="Attachment: Medical Certificate" />
          )}
        </div>
      )}
    </div>
  )
}
