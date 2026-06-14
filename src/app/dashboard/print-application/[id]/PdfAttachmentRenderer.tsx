'use client'

import { useEffect, useState, useRef } from 'react'

declare global {
  interface Window {
    pdfjsLib: any
  }
}

interface PdfAttachmentRendererProps {
  filePath: string
  title: string
}

export function PdfAttachmentRenderer({ filePath, title }: PdfAttachmentRendererProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    async function loadPdf() {
      try {
        // Load PDF.js from CDN if not already loaded
        if (!window.pdfjsLib) {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
          script.async = true
          document.body.appendChild(script)
          await new Promise((resolve) => {
            script.onload = resolve
          })
        }

        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'

        // Load document using standard fetch to ensure cookies/session are included
        const fileUrl = `/uploads/${filePath}`
        const response = await fetch(fileUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        if (!active) return

        setNumPages(pdf.numPages)
        setLoading(false)

        // Render each page sequentially into canvas elements
        if (containerRef.current) {
          containerRef.current.innerHTML = '' // clear previous pages
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const viewport = page.getViewport({ scale: 2.0 }) // High scale for clear printing
            
            const pageContainer = document.createElement('div')
            pageContainer.className = 'pdf-page-container'
            pageContainer.style.pageBreakBefore = 'always'
            pageContainer.style.marginBottom = '20px'
            pageContainer.style.display = 'flex'
            pageContainer.style.flexDirection = 'column'
            pageContainer.style.alignItems = 'center'
            
            const canvas = document.createElement('canvas')
            canvas.style.width = '100%'
            canvas.style.maxWidth = '800px'
            canvas.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
            canvas.style.border = '1px solid #ddd'
            canvas.style.backgroundColor = '#ffffff'
            
            const context = canvas.getContext('2d')
            if (context) {
              canvas.height = viewport.height
              canvas.width = viewport.width
              
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise
            }
            
            pageContainer.appendChild(canvas)
            containerRef.current.appendChild(pageContainer)
          }
        }
      } catch (err: any) {
        console.error('Error rendering PDF attachment:', err)
        if (active) {
          setError(err.message || 'Failed to load PDF')
          setLoading(false)
        }
      }
    }

    loadPdf()

    return () => {
      active = false
    }
  }, [filePath])

  return (
    <div style={{ marginTop: '30px' }} className="pdf-renderer-section">
      <h4 style={{ fontSize: '14px', borderBottom: '2px solid #333', paddingBottom: '6px', marginBottom: '15px' }}>
        📄 {title}
      </h4>
      {loading && <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>Loading pages of PDF attachment...</div>}
      {error && (
        <div style={{ fontSize: '12px', color: '#ef4444', fontStyle: 'italic' }}>
          Failed to display PDF pages directly: {error}. You can view the file{' '}
          <a href={`/uploads/${filePath}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#3b82f6' }}>
            here
          </a>.
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
