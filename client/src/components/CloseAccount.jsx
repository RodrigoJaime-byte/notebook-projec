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

    const paid = parseFloat(paidAmount) || 0
    const monthDetails = getMonthDetails()
    
    if (paid < 0) {
      setError('El monto pagado no puede ser negativo')
      return
    }

    if (paid > (monthDetails.total + monthDetails.carryOver)) {
      setError('El monto pagado no puede ser mayor al total debido')
      return
    }

    setIsLoading(true)
    
    const success = onCloseAccount(parseInt(selectedCustomer), selectedMonth, paid)
    
    if (success) {
      const customer = customers.find(c => c.id === parseInt(selectedCustomer))
      setSuccess(`Cuenta de ${customer?.name} cerrada exitosamente`)
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
        <h2>💰 Cerrar Cuentas Mensuales</h2>
        <p>Cierra las cuentas del mes y registra los pagos</p>
      </div>

      <div className="close-account-content">
        <form onSubmit={handleSubmit} className="close-account-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer">Cliente</label>
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

            <div className="form-group">
              <label htmlFor="month">Mes a Cerrar</label>
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

          {monthDetails && (
            <div className="month-summary">
              <h3>📋 Resumen del Mes</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Cliente:</span>
                  <span className="value">{selectedCustomerData?.name}</span>
                </div>
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
                <h4>🛒 Compras del mes ({monthDetails.items.length})</h4>
                <div className="items-grid">
                  {monthDetails.items.map(item => (
                    <div key={item.id} className="item-card">
                      <div className="item-date">{item.date}</div>
                      <div className="item-product">{item.product}</div>
                      <div className="item-amount">${item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="payment-section">
                <div className="form-group">
                  <label htmlFor="paidAmount">Monto Pagado</label>
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

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !monthDetails}
          >
            {isLoading ? '🔄 Cerrando...' : '🔒 Cerrar Cuenta'}
          </button>
        </form>

        {customers.length === 0 && (
          <div className="no-data">
            <p>👥 No tienes clientes registrados</p>
          </div>
        )}

        {customers.length > 0 && availableMonths.length === 0 && selectedCustomer && (
          <div className="no-data">
            <p>📅 No hay cuentas abiertas para este cliente</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CloseAccount