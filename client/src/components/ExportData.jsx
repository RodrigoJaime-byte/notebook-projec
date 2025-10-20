import { useState } from 'react'

function ExportData({ customers, purchases }) {
  const [selectedCustomer, setSelectedCustomer] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [exportStatus, setExportStatus] = useState('')

  // Obtener meses únicos de las compras (ordenados descendente)
  const months = Array.from(new Set(purchases.map(p => p.month))).sort((a, b) => b.localeCompare(a))

  // Formatear fecha para mostrar en el nombre del archivo
  const formatDateForFilename = () => {
    const now = new Date()
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  }

  // Formatear mes para mostrar (YYYY-MM -> Mes YYYY)
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return ''
    const [year, month] = monthStr.split('-')
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  // Generar CSV para todas las compras o filtradas por cliente/mes
  const generateCSV = () => {
    // Filtrar compras según selección
    let filteredPurchases = [...purchases]
    
    if (selectedCustomer !== 'all') {
      filteredPurchases = filteredPurchases.filter(p => p.customerId === parseInt(selectedCustomer))
    }
    
    if (selectedMonth) {
      filteredPurchases = filteredPurchases.filter(p => p.month === selectedMonth)
    }

    if (filteredPurchases.length === 0) {
      setExportStatus('No hay datos para exportar con los filtros seleccionados')
      return
    }

    // Preparar datos para CSV
    const rows = []
    
    // Encabezados
    rows.push([
      'ID Cliente', 
      'Nombre Cliente', 
      'Mes', 
      'Estado', 
      'Total', 
      'Saldo Anterior', 
      'Saldo Pendiente', 
      'Monto Pagado', 
      'Fecha Producto', 
      'Producto', 
      'Monto'
    ].join(','))
    
    // Datos
    filteredPurchases.forEach(purchase => {
      const customer = customers.find(c => c.id === purchase.customerId) || { name: 'Cliente Desconocido' }
      
      // Si no hay items, agregar una fila con los datos del encabezado
      if (!purchase.items || purchase.items.length === 0) {
        rows.push([
          purchase.customerId,
          customer.name,
          purchase.month,
          purchase.status,
          purchase.total,
          purchase.carryOver,
          purchase.balanceDue,
          purchase.paidAmount || 0,
          '',
          '',
          ''
        ].join(','))
      } else {
        // Agregar una fila por cada item
        purchase.items.forEach(item => {
          rows.push([
            purchase.customerId,
            customer.name,
            purchase.month,
            purchase.status,
            purchase.total,
            purchase.carryOver,
            purchase.balanceDue,
            purchase.paidAmount || 0,
            item.date,
            item.product,
            item.amount
          ].join(','))
        })
      }
    })
    
    // Crear y descargar el archivo CSV
    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Nombre del archivo
    let filename = `notebook_compras_${formatDateForFilename()}`
    if (selectedCustomer !== 'all') {
      const customer = customers.find(c => c.id === parseInt(selectedCustomer))
      if (customer) {
        filename += `_${customer.name.replace(/\s+/g, '_')}`
      }
    }
    if (selectedMonth) {
      filename += `_${selectedMonth}`
    }
    filename += '.csv'
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setExportStatus(`Archivo CSV generado con éxito: ${filename}`)
  }

  return (
    <div className="export-data">
      <h2>Exportar Datos</h2>
      <p className="section-description">
        Exporta los datos de compras a un archivo CSV para análisis o respaldo.
      </p>
      
      <div className="filter-controls">
        <div className="form-group">
          <label htmlFor="customerSelect">Cliente:</label>
          <select 
            id="customerSelect"
            value={selectedCustomer} 
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="form-select"
          >
            <option value="all">Todos los clientes</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="monthSelect">Mes:</label>
          <select 
            id="monthSelect"
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select"
          >
            <option value="">Todos los meses</option>
            {months.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button 
        className="btn-primary" 
        onClick={generateCSV}
        style={{ marginTop: '16px' }}
      >
        📥 Exportar a CSV
      </button>
      
      {exportStatus && (
        <div className={`status-message ${exportStatus.includes('éxito') ? 'success' : 'error'}`}
             style={{ marginTop: '16px', padding: '8px', borderRadius: '4px', 
                     backgroundColor: exportStatus.includes('éxito') ? '#dcfce7' : '#fee2e2' }}>
          {exportStatus}
        </div>
      )}
    </div>
  )
}

export default ExportData