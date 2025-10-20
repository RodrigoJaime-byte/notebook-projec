import { useState } from 'react'

function CloseAccount({ customers, purchases, onCloseAccount }) {
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Obtener meses disponibles para el cliente seleccionado
  const getAvailableMonths = () => {
    if (!selectedCustomer) return []
    
    return purchases
      .filter(p => p.customerId === parseInt(selectedCustomer) && p.status === 'open')
      .map(p => p.month)
      .sort((a, b) => b.localeCompare(a)) // Más reciente primero
  }

  // Obtener detalles del mes seleccionado
  const getMonthDetails = () => {
    if (!selectedCustomer || !selectedMonth) return null
    
    return purchases.find(p => 
      p.customerId === parseInt(selectedCustomer) && 
      p.month === selectedMonth &&
      p.status === 'open'
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!selectedCustomer || !selectedMonth) {
      setError('Por favor selecciona cliente y mes')
      return
    }

    const monthDetails = getMonthDetails()
    if (!monthDetails) {
      setError('No hay cuenta abierta para ese mes')
      return
    }

    const paidRaw = parseFloat(paidAmount)
    const paid = isNaN(paidRaw) ? 0 : Math.round(paidRaw * 100) / 100
    const totalDue = Math.round((monthDetails.total + monthDetails.carryOver) * 100) / 100

    if (paid < 0) {
      setError('El monto pagado no puede ser negativo')
      return
    }

    if (paid > totalDue) {
      setError('El monto pagado no puede ser mayor al total debido')
      return
    }

    setIsLoading(true)
    
    const ok = onCloseAccount(parseInt(selectedCustomer, 10), selectedMonth, paid)
    
    if (ok) {
      const customer = customers.find(c => c.id === parseInt(selectedCustomer, 10))
      const remaining = Math.max(0, Math.round((totalDue - paid) * 100) / 100)
      setSuccess(
        remaining === 0
          ? `Cuenta de ${customer?.name} pagada totalmente`
          : `Cuenta de ${customer?.name} cerrada con saldo pendiente: $${remaining.toLocaleString()}`
      )
      setSelectedMonth('')
      setPaidAmount('')
    } else {
      setError('Error al cerrar la cuenta')
    }
    
    setIsLoading(false)
  }

  const monthDetails = getMonthDetails()
  const availableMonths = getAvailableMonths()
  const selectedCustomerData = customers.find(c => c.id === parseInt(selectedCustomer))

  return (
    <div className="close-account-container">
      <div className="section-header">
        <div className="section-title">
          <span className="section-icon">💰</span>
          <h2>Cerrar Cuentas Mensuales</h2>
        </div>
        <p className="section-description">Cierra las cuentas del mes y registra los pagos</p>
      </div>

      <div className="close-account-content">
        <div className="account-selection-card">
          <form onSubmit={handleSubmit} className="close-account-form">
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{error}</span>
                <button 
                  type="button" 
                  className="alert-close" 
                  onClick={() => setError('')}
                  aria-label="Cerrar alerta"
                >
                  ×
                </button>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span className="alert-text">{success}</span>
                <button 
                  type="button" 
                  className="alert-close" 
                  onClick={() => setSuccess('')}
                  aria-label="Cerrar alerta"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="selection-header">
              <h3>Seleccionar Cuenta</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customer" className="form-label">Cliente</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <select
                    id="customer"
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value)
                      setSelectedMonth('')
                      setPaidAmount('')
                      setError('')
                      setSuccess('')
                    }}
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="month" className="form-label">Mes a Cerrar</label>
                <div className="input-with-icon">
                  <span className="input-icon">📅</span>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value)
                      setPaidAmount('')
                      setError('')
                      setSuccess('')
                    }}
                    className="form-select"
                    disabled={isLoading || !selectedCustomer}
                  >
                    <option value="">Seleccionar mes...</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {new Date(month + '-01').toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {customers.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No tienes clientes registrados</p>
              </div>
            )}

            {customers.length > 0 && availableMonths.length === 0 && selectedCustomer && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No hay cuentas abiertas para este cliente</p>
              </div>
            )}

            {monthDetails && (
              <div className="month-summary">
                <div className="summary-header">
                  <h3>
                    <span className="summary-icon">📋</span>
                    Resumen del Mes
                  </h3>
                  <div className="customer-badge">
                    <span className="customer-icon">👤</span>
                    {selectedCustomerData?.name}
                  </div>
                </div>
                
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Compras del mes:</span>
                    <span className="value">${monthDetails.total.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Saldo anterior:</span>
                    <span className="value">${monthDetails.carryOver.toLocaleString()}</span>
                  </div>
                  <div className="summary-item total">
                    <span className="label">Total a pagar:</span>
                    <span className="value">${(monthDetails.total + monthDetails.carryOver).toLocaleString()}</span>
                  </div>
                </div>

                <div className="items-list">
                  <div className="items-header">
                    <h4>
                      <span className="items-icon">🛒</span>
                      Compras del mes
                    </h4>
                    <span className="items-count">{monthDetails.items.length}</span>
                  </div>
                  
                  <div className="items-grid">
                    {monthDetails.items.map(item => (
                      <div key={item.id} className="item-card">
                        <div className="item-date">
                          <span className="date-icon">📆</span>
                          {item.date}
                        </div>
                        <div className="item-product">{item.product}</div>
                        <div className="item-amount">${item.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="payment-section">
                  <h4>
                    <span className="payment-icon">💵</span>
                    Registrar Pago
                  </h4>
                  <div className="form-group">
                    <label htmlFor="paidAmount" className="form-label">Monto Pagado</label>
                    <div className="input-with-icon">
                      <span className="input-icon">💰</span>
                      <input
                        id="paidAmount"
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        step="0.01"
                        min="0"
                        max={monthDetails.total + monthDetails.carryOver}
                        disabled={isLoading}
                      />
                    </div>
                    <small className="form-hint">
                      Máximo: ${(monthDetails.total + monthDetails.carryOver).toLocaleString()}
                    </small>
                  </div>

                  {paidAmount && (
                    <div className="payment-preview">
                      <div className="preview-item">
                        <span>Monto pagado:</span>
                        <span>${parseFloat(paidAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="preview-item">
                        <span>Saldo restante:</span>
                        <span>${Math.max(0, (monthDetails.total + monthDetails.carryOver) - parseFloat(paidAmount || 0)).toLocaleString()}</span>
                      </div>
                      <div className="preview-status">
                        {parseFloat(paidAmount || 0) >= (monthDetails.total + monthDetails.carryOver) ? (
                          <span className="status-paid">✅ Cuenta totalmente pagada</span>
                        ) : (
                          <span className="status-pending">⏳ Saldo pendiente para próximo mes</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoading || !monthDetails}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔒</span>
                    Cerrar Cuenta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CloseAccount