// Turns an array of flat objects into a downloadable CSV file, entirely in
// the browser — no backend endpoint needed for datasets this size.
export function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escape = (val) => {
    const str = val == null ? '' : String(val)
    // Quote any field containing a comma, quote, or newline; double up
    // internal quotes per the CSV spec.
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
