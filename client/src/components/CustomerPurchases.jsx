import { useState } from 'react'

function CustomerPurchases({ purchases, user }) {
  const [selectedMonth, setSelectedMonth] = useState('')

  // Obtener todos los meses disponibles
  const getAvailableMonths = () => {
    return [...new Set(purchases.map(p => p.month))]
      .sort((a, b) => b.localeCompare(a)) // Más reciente primero
  }

  // Obtener detalles del mes seleccionado
  const getMonthDetails = (month) => {
    return purchases.find(p => p.month === month)
  }

  const availableMonths = getAvailableMonths()
  const currentMonth = new Date().toISOString().substring(0, 7)
  const currentMonthData = getMonthDetails(currentMonth)

  return (
    <div className="customer-purchases-container">
      <div className="section-header">
        <h2>📚 Mis Compras</h2>
        <p>Revisa tu historial de compras y saldos</p>
      </div>

      {/* Resumen actual */}
      {currentMonthData && (
        <div className="current-month-summary">
          <h3>📅 Mes Actual - {new Date(currentMonth + '-01').toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
          })}</h3>
          
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">🛒</div>
              <div className="card-content">
                <h4>Compras del Mes</h4>
                <p className="card-amount">${currentMonthData.total.toLocaleString()}</p>
              </div>
            </div>

            {currentMonthData.carryOver > 0 && (
              <div className="summary-card">
                <div className="card-icon">⏳</div>
                <div className="card-content">
                  <h4>Saldo Anterior</h4>
                  <p className="card-amount">${currentMonthData.carryOver.toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="summary-card total">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Total a Pagar</h4>
                <p className="card-amount">${(currentMonthData.total + currentMonthData.carryOver).toLocaleString()}</p>
              </div>
            </div>

            <div className="summary-card status">
              <div className="card-icon">
                {currentMonthData.status === 'open' ? '📖' : 
                 currentMonthData.status === 'closed' ? '🔒' : '✅'}
              </div>
              <div className="card-content">
                <h4>Estado</h4>
                <p className={`status-text ${currentMonthData.status}`}>
                  {currentMonthData.status === 'open' ? 'Abierto' : 
                   currentMonthData.status === 'closed' ? 'Cerrado' : 'Pagado'}
                </p>
              </div>
            </div>
          </div>

          {/* Compras del mes actual */}
          <div className="current-purchases">
            <h4>🛒 Compras de este mes ({currentMonthData.items.length})</h4>
            <div className="purchases-list">
              {currentMonthData.items.map(item => (
                <div key={item.id} className="purchase-item">
                  <div className="item-date">{new Date(item.date).toLocaleDateString()}</div>
                  <div className="item-product">{item.product}</div>
                  <div className="item-amount">${item.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historial de meses */}
      <div className="history-section">
        <h3>📋 Historial de Meses</h3>
        
        {availableMonths.length === 0 ? (
          <div className="no-purchases">
            <p>🌟 Aún no tienes compras registradas</p>
            <p>Cuando realices compras aparecerán aquí</p>
          </div>
        ) : (
          <>
            <div className="month-selector">
              <label htmlFor="monthSelect">Ver mes específico:</label>
              <select
                id="monthSelect"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select"
              >
                <option value="">Todos los meses</option>
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

            <div className="months-grid">
              {(selectedMonth ? [selectedMonth] : availableMonths).map(month => {
                const monthData = getMonthDetails(month)
                if (!monthData) return null

                return (
                  <div key={month} className="month-card">
                    <div className="month-header">
                      <h4>{new Date(month + '-01').toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}</h4>
                      <span className={`status-badge ${monthData.status}`}>
                        {monthData.status === 'open' ? 'Abierto' : 
                         monthData.status === 'closed' ? 'Cerrado' : 'Pagado'}
                      </span>
                    </div>

                    <div className="month-summary">
                      <div className="summary-row">
                        <span>Compras:</span>
                        <span>${monthData.total.toLocaleString()}</span>
                      </div>
                      {monthData.carryOver > 0 && (
                        <div className="summary-row">
                          <span>Saldo anterior:</span>
                          <span>${monthData.carryOver.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>${(monthData.total + monthData.carryOver).toLocaleString()}</span>
                      </div>
                      {monthData.paidAmount > 0 && (
                        <div className="summary-row paid">
                          <span>Pagado:</span>
                          <span>${monthData.paidAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {monthData.balanceDue > 0 && (
                        <div className="summary-row pending">
                          <span>Saldo pendiente:</span>
                          <span>${monthData.balanceDue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="month-items">
                      <h5>Compras ({monthData.items.length})</h5>
                      <div className="items-list">
                        {monthData.items.map(item => (
                          <div key={item.id} className="item-row">
                            <span className="item-date">{new Date(item.date).toLocaleDateString()}</span>
                            <span className="item-product">{item.product}</span>
                            <span className="item-amount">${item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CustomerPurchases