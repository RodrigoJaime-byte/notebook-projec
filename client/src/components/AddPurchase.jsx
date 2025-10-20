import { useState, useMemo, useRef, useEffect } from 'react'

function AddPurchase({ onAddPurchase, customers = [], purchases = [] }) {
  const [customerId, setCustomerId] = useState('')
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const productInputRef = useRef(null)
  
  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          productInputRef.current && !productInputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cálculo seguro del mes actual en zona horaria local
  const getLocalYearMonth = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  const [selectedMonth, setSelectedMonth] = useState(getLocalYearMonth())

  // Meses disponibles a partir de compras existentes
  const months = Array.from(new Set(purchases.map(p => p.month))).sort((a, b) => b.localeCompare(a))
  const formatMoney = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Catálogo de productos desde historial de compras (únicos y ordenados)
  const productCatalog = useMemo(() => {
    const names = purchases.flatMap(p => (p.items || []).map(it => it.product).filter(Boolean))
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
  }, [purchases])

  // Cliente seleccionado como número (reutilizado en varias secciones)
  const selectedCustomerIdNum = parseInt(customerId || '0', 10)

  // Mapa de frecuencias de productos (filtrado por cliente si está seleccionado; si no, global)
  const productFreqMap = useMemo(() => {
    const source = selectedCustomerIdNum
      ? purchases.filter(p => p.customerId === selectedCustomerIdNum)
      : purchases

    const freq = new Map()
    source.forEach(p => {
      (p.items || []).forEach(it => {
        const name = it.product?.trim()
        if (!name) return
        freq.set(name, (freq.get(name) || 0) + 1)
      })
    })
    return freq
  }, [purchases, selectedCustomerIdNum])

  // Top productos frecuentes con conteo
  const topProductStats = useMemo(() => {
    return Array.from(productFreqMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) // por frecuencia, luego alfabético
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [productFreqMap])

  // Sugerencias por relevancia con conteo:
  // - Prioriza coincidencias que empiezan al inicio
  // - Luego por posición de coincidencia
  // - Luego por frecuencia desc
  // - Finalmente alfabético
  const filteredSuggestions = useMemo(() => {
    const q = product.trim().toLowerCase()
    if (q.length < 2) return []
    const entries = Array.from(productFreqMap.entries())
      .map(([name, count]) => {
        const lower = name.toLowerCase()
        const idx = lower.indexOf(q)
        const starts = lower.startsWith(q)
        return { name, count, idx, starts }
      })
      .filter(e => e.idx !== -1)

    entries.sort((a, b) => {
      if (a.starts !== b.starts) return b.starts - a.starts       // empieza al inicio primero
      if (a.idx !== b.idx) return a.idx - b.idx                   // posición de coincidencia
      if (a.count !== b.count) return b.count - a.count           // más frecuente primero
      return a.name.localeCompare(b.name)
    })

    return entries.slice(0, 8)
  }, [product, productFreqMap])

  // Helper para resaltar la coincidencia dentro del nombre del producto
  const renderHighlighted = (name, idx, q) => {
    const qLen = q.trim().length
    if (idx < 0 || qLen === 0) return name
    return (
      <span>
        <span>{name.slice(0, idx)}</span>
        <span style={{ fontWeight: 600 }}>{name.slice(idx, idx + qLen)}</span>
        <span>{name.slice(idx + qLen)}</span>
      </span>
    )
  }

  const applySuggestion = (name) => setProduct(name)

  // Sincronizar fecha al cambiar de mes
  const handleMonthChange = (m) => {
    setSelectedMonth(m)
    // Ajustar fecha al primer día del mes seleccionado
    setDate(`${m}-01`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validaciones básicas
    if (customers.length === 0) {
      setError('No hay clientes registrados. Crea un cliente primero.')
      setIsLoading(false)
      return
    }

    if (!customerId) {
      setError('Selecciona un cliente')
      setIsLoading(false)
      return
    }

    if (!product.trim() || product.trim().length < 2) {
      setError('El producto debe tener al menos 2 caracteres')
      setIsLoading(false)
      return
    }

    if (!date) {
      setError('La fecha es requerida')
      setIsLoading(false)
      return
    }

    // Validar que la fecha pertenezca al mes seleccionado
    const monthFromDate = date.slice(0, 7)
    if (monthFromDate !== selectedMonth) {
      setError('La fecha no coincide con el mes seleccionado')
      setIsLoading(false)
      return
    }

    const valueAmount = parseFloat(amount)
    if (isNaN(valueAmount) || valueAmount <= 0) {
      setError('El monto debe ser un número mayor a 0')
      setIsLoading(false)
      return
    }

    // Normalizar a 2 decimales
    const normalizedAmount = Math.round(valueAmount * 100) / 100

    // Llamar a la función de agregar compra
    const result = onAddPurchase(parseInt(customerId, 10), {
      product: product.trim(),
      amount: normalizedAmount,
      date
    })

    if (result) {
      setSuccess('Compra registrada exitosamente')
      setProduct('')
      setAmount('')
      setDate(`${selectedMonth}-01`)
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError('No se pudo registrar la compra. Verifica los datos o que la cuenta esté abierta para este mes.')
    }

    setIsLoading(false)
  }

  const resetForm = () => {
    setCustomerId('')
    setProduct('')
    setAmount('')
    setDate(`${selectedMonth}-01`)
    setError('')
    setSuccess('')
  }

  // Resumen del mes seleccionado para el cliente elegido
  const monthData = purchases.find(p => p.customerId === selectedCustomerIdNum && p.month === selectedMonth)
  const statusLabel = { open: 'Abierto', closed: 'Cerrado', paid: 'Pagado' }

  return (
    <div className="purchase-container">
      <div className="purchase-form-section">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">🛒</div>
            <h2>Agregar Compra</h2>
            <p>Registra una nueva compra para un cliente</p>
          </div>

          <form onSubmit={handleSubmit} className="purchase-form">
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

        <div className="form-group">
          <label htmlFor="customerId" className="form-label">Cliente *</label>
          <div className="input-with-icon">
            <span className="input-icon">👤</span>
            <select
              id="customerId"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="form-input"
              disabled={isLoading}
            >
              <option value="">Selecciona un cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} (@{customer.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Mes */}
        <div className="form-group">
          <label htmlFor="month" className="form-label">Mes *</label>
          <div className="input-with-icon">
            <span className="input-icon">📅</span>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="form-input"
              disabled={isLoading}
            >
              {/* Mostrar mes actual por defecto, aunque no exista en compras */}
              <option value={getLocalYearMonth()}>
                Actual ({new Date(`${getLocalYearMonth()}-01`).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })})
              </option>
              {months.map(m => (
                <option key={m} value={m}>
                  {new Date(`${m}-01`).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha *</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="product">Producto *</label>
          <input
            id="product"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Ej: Coca Cola 600ml"
            className="form-input"
            list="productOptions"
            disabled={isLoading}
          />
          {/* Autocomplete nativo con historial */}
          <datalist id="productOptions">
            {productCatalog.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>

          {/* Productos frecuentes (chips siempre visibles con conteo) */}
          {topProductStats.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Productos frecuentes {selectedCustomerIdNum ? 'del cliente' : 'globales'}:
              </span>
              <div className="top-suggestions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {topProductStats.map(({ name, count }) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => applySuggestion(name)}
                    className="btn"
                    style={{ padding: '4px 8px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#f9fafb' }}
                  >
                    {name} · x{count}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias rápidas según texto ingresado con conteo y orden por relevancia */}
          {filteredSuggestions.length > 0 && (
            <div className="suggestions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {filteredSuggestions.map(({ name, count, idx }) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => applySuggestion(name)}
                  className="btn"
                  style={{ padding: '4px 8px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#f9fafb' }}
                  aria-label={`${name}, ${count} ocurrencias`}
                >
                  {renderHighlighted(name, idx, product)} · x{count}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Monto *</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || customers.length === 0}
          >
            {isLoading ? 'Registrando...' : 'Registrar Compra'}
          </button>
        </div>
      </form>
        </div>
      </div>
      
      <div className="purchase-stats-section">
        <div className="stats-card">
          <h3 className="stats-title">
            <span className="stats-icon">📊</span> 
            Estadísticas
          </h3>
          
          {selectedCustomerIdNum > 0 && (
            <div className="customer-summary">
              <h4>Resumen del Cliente</h4>
              <div className="customer-name">
                {customers.find(c => c.id === selectedCustomerIdNum)?.name || 'Cliente'}
              </div>
              
              {monthData ? (
                <div className="month-summary">
                  <div className="summary-row">
                    <span className="summary-label">Estado:</span>
                    <span className={`status-pill status-${monthData.status}`}>
                      {statusLabel[monthData.status]}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Total del mes:</span>
                    <span className="summary-value">{formatMoney(monthData.total)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Productos:</span>
                    <span className="summary-value">{monthData.items.length}</span>
                  </div>
                </div>
              ) : (
                <div className="empty-month">
                  No hay compras para este cliente en {new Date(`${selectedMonth}-01`).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          )}
          
          <div className="popular-products">
            <h4>Productos Populares</h4>
            {topProductStats.length > 0 ? (
              <div className="product-stats-list">
                {topProductStats.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="product-stat-item"
                    onClick={() => applySuggestion(item.name)}
                  >
                    <div className="product-rank">{idx + 1}</div>
                    <div className="product-name">{item.name}</div>
                    <div className="product-count">{item.count}x</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-stats">
                No hay datos de productos disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen del mes seleccionado */}
      {customerId && (
        <div className="summary-card" style={{ marginTop: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h4>📅 Resumen del mes ({new Date(`${selectedMonth}-01`).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })})</h4>
          {monthData ? (
            <ul style={{ marginTop: 8, lineHeight: 1.6 }}>
              <li>Compras: {monthData.items.length}</li>
              <li>Total: {formatMoney(monthData.total)}</li>
              {'balanceDue' in monthData && <li>Saldo: {formatMoney(monthData.balanceDue)}</li>}
              <li>Estado: {statusLabel[monthData.status] || 'Desconocido'}</li>
            </ul>
          ) : (
            <p style={{ marginTop: 8 }}>No hay cuenta registrada para este mes.</p>
          )}
        </div>
      )}

      {customers.length === 0 && (
        <div className="alert alert-info">
          <span className="alert-icon">ℹ️</span>
          <span className="alert-text">
            No hay clientes registrados. Crea un cliente primero.
          </span>
        </div>
      )}
    </div>
  )
}

export default AddPurchase