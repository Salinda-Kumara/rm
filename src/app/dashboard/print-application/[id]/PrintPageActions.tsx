'use client'

import styles from './print.module.css'

export function PrintPageActions() {
  return (
    <div className={`${styles.toolbar} ${styles.noPrint}`}>
      <div className={styles.toolbarTitle}>
        📄 SAB Exam Portal — Print Preview
      </div>
      <div className={styles.toolbarActions}>
        <button 
          onClick={() => window.print()} 
          className={styles.btnPrint}
        >
          🖨️ Print Application
        </button>
        <button 
          onClick={() => window.history.back()} 
          className={styles.btnCancel}
        >
          ← Go Back
        </button>
      </div>
    </div>
  )
}
