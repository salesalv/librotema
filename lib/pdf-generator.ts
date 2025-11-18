import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Logbook, ClassSession } from './types'

interface PDFGeneratorOptions {
  logbook: Logbook
  teacherName: string
  subjectName: string
  courseName: string
}

export function generateLogbookPDF(options: PDFGeneratorOptions) {
  const { logbook, teacherName, subjectName, courseName } = options
  
  // Crear documento PDF en formato A4 horizontal para mejor visualización de la tabla
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // Configurar fuente
  doc.setFont('helvetica')

  // ============ ENCABEZADO ============
  // Línea superior decorativa
  doc.setLineWidth(0.5)
  doc.line(10, 10, 287, 10)
  
  // Título principal
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('LIBRO DE TEMAS', 148.5, 20, { align: 'center' })
  
  // Subtítulo con información del libro
  doc.setFontSize(14)
  doc.text(`${subjectName} - ${courseName}`, 148.5, 28, { align: 'center' })
  
  // Línea inferior decorativa
  doc.setLineWidth(0.5)
  doc.line(10, 32, 287, 32)

  // ============ INFORMACIÓN DEL PROFESOR ============
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Profesor/a:', 15, 42)
  doc.setFont('helvetica', 'normal')
  doc.text(teacherName, 45, 42)

  // Fecha de generación
  doc.setFont('helvetica', 'bold')
  doc.text('Fecha de generación:', 200, 42)
  doc.setFont('helvetica', 'normal')
  const now = new Date()
  doc.text(now.toLocaleDateString('es-AR'), 245, 42)

  // Total de clases
  doc.setFont('helvetica', 'bold')
  doc.text('Total de clases:', 15, 48)
  doc.setFont('helvetica', 'normal')
  doc.text(`${logbook.sessions.length} ${logbook.sessions.length === 1 ? 'clase' : 'clases'}`, 50, 48)

  // Clases verificadas
  const verifiedCount = logbook.sessions.filter(s => s.teacherVerification).length
  doc.setFont('helvetica', 'bold')
  doc.text('Verificadas por profesor:', 200, 48)
  doc.setFont('helvetica', 'normal')
  doc.text(`${verifiedCount} de ${logbook.sessions.length}`, 252, 48)

  // ============ TABLA DE CLASES ============
  const tableData = logbook.sessions.map((session) => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    return [
      session.day.toString(),
      monthNames[session.month - 1] || session.month.toString(),
      session.classNumber.toString(),
      session.classCharacter,
      session.content,
      session.task,
      session.teacherVerification ? '✓✓' : '',
      session.observations || '-',
      session.directorVerification?.verified ? '✓ Verificado' : 'Pendiente'
    ]
  })

  autoTable(doc, {
    startY: 55,
    head: [[
      'Día',
      'Mes',
      'Clase N°',
      'Carácter',
      'Contenido',
      'Tarea a Realizar',
      'Verif.\nProfesor',
      'Observaciones',
      'Verif.\nDirector'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      font: 'helvetica',
      textColor: [0, 0, 0],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // Día
      1: { cellWidth: 22, halign: 'center' }, // Mes
      2: { cellWidth: 15, halign: 'center' }, // Clase N°
      3: { cellWidth: 25, halign: 'center' }, // Carácter
      4: { cellWidth: 55, halign: 'left' },   // Contenido
      5: { cellWidth: 50, halign: 'left' },   // Tarea
      6: { cellWidth: 15, halign: 'center' }, // Verif. Profesor
      7: { cellWidth: 45, halign: 'left' },   // Observaciones
      8: { cellWidth: 23, halign: 'center' }  // Verif. Director
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 10, right: 10 }
  })

  // ============ PIE DE PÁGINA CON FIRMAS ============
  // Obtener la posición Y final de la tabla
  const finalY = (doc as any).lastAutoTable.finalY || 150
  
  // Espacio antes de las firmas
  const signatureY = finalY + 25

  // Línea separadora
  doc.setLineWidth(0.3)
  doc.line(10, signatureY - 10, 287, signatureY - 10)

  // Firma del Profesor
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.line(30, signatureY, 90, signatureY)
  doc.text('Firma del Profesor', 60, signatureY + 5, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Fecha: ___/___/_____`, 60, signatureY + 10, { align: 'center' })

  // Firma del Director
  doc.line(207, signatureY, 267, signatureY)
  doc.setFontSize(10)
  doc.text('Firma del Director', 237, signatureY + 5, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Fecha: ___/___/_____`, 237, signatureY + 10, { align: 'center' })

  // ============ PIE DE PÁGINA (NÚMERO DE PÁGINA) ============
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(
      `Página ${i} de ${pageCount}`,
      148.5,
      200,
      { align: 'center' }
    )
  }

  // ============ GUARDAR PDF ============
  // Generar nombre de archivo
  const fileName = `LibroTemas_${subjectName}_${courseName}_${now.getFullYear()}.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
  
  doc.save(fileName)
}

