import { useState } from 'react'

function AddPurchase({ onAddPurchase, customers }) {
  const [customerId, setCustomerId] = useState('')
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validaciones básicas
    if (!customerId || !product.trim() || !amount || !date) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    if (parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0')
      setIsLoading(false)
      return
    }

    // Llamar a la función de agregar compra
    const result = onAddPurchase(parseInt(customerId), {
      product: product.trim(),
      amount: parseFloat(amount),
      date
    })

    if (result) {
      setSuccess('Compra registrada exitosamente')
      setProduct('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError('Error al registrar la compra')
    }

    setIsLoading(false)
  }

  const resetForm = () => {
    setCustomerId('')
    setProduct('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setError('')
    setSuccess('')
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>📝 Agregar Compra</h2>
        <p>Registra una nueva compra para un cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-text">{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span className="alert-text">{success}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="customerId">Cliente *</label>
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
            disabled={isLoading}
          />
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
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrar Compra'}
          </button>
        </div>
      </form>

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