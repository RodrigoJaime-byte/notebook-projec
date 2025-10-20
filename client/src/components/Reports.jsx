import { useState, useEffect } from 'react'

function Reports({ customers, purchases }) {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [reportData, setReportData] = useState(null)
  
  // Obtener meses únicos de las compras (ordenados descendente)
  const months = Array.from(new Set(purchases.map(p => p.month))).sort((a, b) => b.localeCompare(a))
  
  // Obtener mes actual
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  
  // Formatear mes para mostrar (YYYY-MM -> Mes YYYY)
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return ''
    const [year, month] = monthStr.split('-')
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }
  
  // Formatear dinero
  const formatMoney = (amount) => {
    return `$${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  // Generar datos del reporte cuando cambia el mes seleccionado
  useEffect(() => {
    if (!selectedMonth && months.length > 0) {
      // Si no hay mes seleccionado, usar el mes actual o el más reciente
      const currentMonth = getCurrentMonth()
      const initialMonth = months.includes(currentMonth) ? currentMonth : months[0]
      setSelectedMonth(initialMonth)
      return
    }
    
    if (!selectedMonth) return
    
    // Filtrar compras del mes seleccionado
    const monthlyPurchases = purchases.filter(p => p.month === selectedMonth)
    
    // Calcular estadísticas
    const totalSales = monthlyPurchases.reduce((sum, p) => sum + p.total, 0)
    const totalPaid = monthlyPurchases
      .filter(p => p.status === 'paid' || p.status === 'closed')
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0)
    const pendingPayments = monthlyPurchases
      .filter(p => p.status !== 'paid')
      .reduce((sum, p) => sum + p.balanceDue, 0)
    
    // Calcular ventas por cliente
    const salesByCustomer = []
    monthlyPurchases.forEach(purchase => {
      const customer = customers.find(c => c.id === purchase.customerId)
      if (customer) {
        const existingCustomer = salesByCustomer.find(item => item.id === customer.id)
        if (existingCustomer) {
          existingCustomer.total += purchase.total
        } else {
          salesByCustomer.push({
            id: customer.id,
            name: customer.name,
            total: purchase.total
          })
        }
      }
    })
    
    // Ordenar por total de ventas (mayor a menor)
    salesByCustomer.sort((a, b) => b.total - a.total)
    
    // Calcular el porcentaje para cada cliente
    const totalForPercentage = salesByCustomer.reduce((sum, c) => sum + c.total, 0)
    salesByCustomer.forEach(customer => {
      customer.percentage = totalForPercentage > 0 
        ? (customer.total / totalForPercentage) * 100 
        : 0
    })
    
    // Calcular productos más vendidos
    const productSales = {}
    monthlyPurchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (productSales[item.product]) {
          productSales[item.product] += item.amount
        } else {
          productSales[item.product] = item.amount
        }
      })
    })
    
    // Convertir a array y ordenar
    const topProducts = Object.entries(productSales)
      .map(([product, amount]) => ({ product, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5 productos
    
    // Calcular el porcentaje para cada producto
    const totalProductSales = topProducts.reduce((sum, p) => sum + p.amount, 0)
    topProducts.forEach(product => {
      product.percentage = totalProductSales > 0 
        ? (product.amount / totalProductSales) * 100 
        : 0
    })
    
    setReportData({
      totalSales,
      totalPaid,
      pendingPayments,
      salesByCustomer,
      topProducts
    })
  }, [selectedMonth, purchases, customers])
  
  return (
    <div className="reports-container">
      <h2>Reportes y Estadísticas</h2>
      <p className="section-description">
        Visualiza estadísticas de ventas y comportamiento de clientes.
      </p>
      
      <div className="filter-controls">
        <div className="form-group">
          <label htmlFor="monthSelect">Mes del Reporte:</label>
          <select 
            id="monthSelect"
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select"
          >
            {months.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {reportData && (
        <div className="report-content">
          {/* Resumen de ventas */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Ventas Totales</h3>
                <p className="stat-number">{formatMoney(reportData.totalSales)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Pagos Recibidos</h3>
                <p className="stat-number">{formatMoney(reportData.totalPaid)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pagos Pendientes</h3>
                <p className="stat-number">{formatMoney(reportData.pendingPayments)}</p>
              </div>
            </div>
          </div>
          
          {/* Gráfico de ventas por cliente */}
          <div className="chart-section">
            <h3>Ventas por Cliente</h3>
            <div className="bar-chart">
              {reportData.salesByCustomer.map((customer, index) => (
                <div key={customer.id} className="chart-item">
                  <div className="chart-label">
                    <span className="customer-name">{customer.name}</span>
                    <span className="customer-value">{formatMoney(customer.total)}</span>
                  </div>
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        width: `${customer.percentage}%`,
                        backgroundColor: `hsl(${210 + index * 30}, 70%, 60%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Productos más vendidos */}
          <div className="chart-section">
            <h3>Productos Más Vendidos</h3>
            <div className="bar-chart">
              {reportData.topProducts.map((product, index) => (
                <div key={product.product} className="chart-item">
                  <div className="chart-label">
                    <span className="product-name">{product.product}</span>
                    <span className="product-value">{formatMoney(product.amount)}</span>
                  </div>
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        width: `${product.percentage}%`,
                        backgroundColor: `hsl(${120 + index * 30}, 70%, 60%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports