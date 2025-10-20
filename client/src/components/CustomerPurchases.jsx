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
        <div className="section-title">
          <span className="section-icon">📚</span>
          <h2>Mis Compras</h2>
        </div>
        <p className="section-description">Revisa tu historial de compras y saldos</p>
      </div>

      {/* Resumen actual */}
      {currentMonthData && (
        <div className="current-month-card">
          <div className="month-header">
            <h3>
              <span className="month-icon">📅</span>
              Mes Actual
            </h3>
            <div className="month-date">
              {new Date(currentMonth + '-01').toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
          
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
                <div className={`status-badge status-${currentMonthData.status}`}>
                  {currentMonthData.status === 'open' ? 'Abierto' : 
                   currentMonthData.status === 'closed' ? 'Cerrado' : 'Pagado'}
                </div>
              </div>
            </div>
          </div>

          {/* Compras del mes actual */}
          <div className="current-purchases">
            <div className="purchases-header">
              <h4>
                <span className="purchases-icon">🛒</span>
                Compras de este mes
              </h4>
              <div className="purchases-count">{currentMonthData.items.length}</div>
            </div>
            
            {currentMonthData.items.length > 0 ? (
              <div className="purchases-list">
                {currentMonthData.items.map(item => (
                  <div key={item.id} className="purchase-item">
                    <div className="item-date">
                      <span className="date-icon">📆</span>
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="item-product">{item.product}</div>
                    <div className="item-amount">${item.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-purchases">
                <div className="empty-icon">🛍️</div>
                <p>No hay compras registradas este mes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de meses */}
      <div className="history-card">
        <div className="history-header">
          <h3>
            <span className="history-icon">📋</span>
            Historial de Meses
          </h3>
        </div>
        
        {availableMonths.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌟</div>
            <p>Aún no tienes compras registradas</p>
            <p>Cuando realices compras aparecerán aquí</p>
          </div>
        ) : (
          <>
            <div className="month-selector">
              <label htmlFor="month-select" className="form-label">Selecciona un mes:</label>
              <div className="input-with-icon">
                <span className="input-icon">📅</span>
                <select 
                  id="month-select"
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
            </div>

            <div className="months-grid">
              {(selectedMonth ? [selectedMonth] : availableMonths).map(month => {
                const monthData = getMonthDetails(month)
                if (!monthData) return null

                return (
                  <div key={month} className="month-card">
                    <div className="month-header">
                      <h4>
                        <span className="month-icon">📅</span>
                        {new Date(month + '-01').toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </h4>
                      <span className={`status-badge status-${monthData.status}`}>
                        {monthData.status === 'open' ? 'Abierto' : 
                         monthData.status === 'closed' ? 'Cerrado' : 'Pagado'}
                      </span>
                    </div>

                    <div className="month-summary-grid">
                      <div className="summary-item">
                        <span className="label">Compras:</span>
                        <span className="value">${monthData.total.toLocaleString()}</span>
                      </div>
                      {monthData.carryOver > 0 && (
                        <div className="summary-item">
                          <span className="label">Saldo anterior:</span>
                          <span className="value">${monthData.carryOver.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="summary-item total">
                        <span className="label">Total:</span>
                        <span className="value">${(monthData.total + monthData.carryOver).toLocaleString()}</span>
                      </div>
                      {monthData.paidAmount > 0 && (
                        <div className="summary-item">
                          <span className="label">Pagado:</span>
                          <span className="value">${monthData.paidAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {monthData.balanceDue > 0 && (
                        <div className="summary-item">
                          <span className="label">Saldo pendiente:</span>
                          <span className="value">${monthData.balanceDue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="month-purchases">
                      <div className="purchases-header">
                        <h5>
                          <span className="purchases-icon">🛒</span>
                          Compras
                        </h5>
                        <div className="purchases-count">{monthData.items.length}</div>
                      </div>
                      <div className="items-list">
                        {monthData.items.map(item => (
                          <div key={item.id} className="item-row">
                            <span className="item-date">
                              <span className="date-icon">📆</span>
                              {new Date(item.date).toLocaleDateString()}
                            </span>
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