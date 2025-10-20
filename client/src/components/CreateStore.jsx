import { useState } from 'react'

function CreateStore({ onCreateStore, existingStores = [] }) {
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validaciones básicas
    if (!storeName.trim()) {
      setError('El nombre de la tienda es requerido')
      setIsLoading(false)
      return
    }

    if (storeName.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      setIsLoading(false)
      return
    }

    // Verificar si ya existe una tienda con este nombre
    if (existingStores.some(store => store.name.toLowerCase() === storeName.trim().toLowerCase())) {
      setError('Ya existe una tienda con este nombre')
      setIsLoading(false)
      return
    }

    // Llamar a la función de creación
    const result = onCreateStore(storeName.trim())

    if (result) {
      setSuccess('Tienda creada exitosamente')
      setStoreName('')
      setDescription('')
      setAddress('')
      setPhone('')
      
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError('Error al crear la tienda')
    }

    setIsLoading(false)
  }

  const resetForm = () => {
    setStoreName('')
    setDescription('')
    setAddress('')
    setPhone('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>🏪 Crear Tienda</h2>
        <p>Configura tu tienda para comenzar a gestionar clientes</p>
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
          <label htmlFor="storeName">Nombre de la Tienda *</label>
          <input
            id="storeName"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Ej: Tienda Don Juan"
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción de tu tienda (opcional)"
            className="form-input"
            rows="3"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Dirección</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección de la tienda (opcional)"
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Número de teléfono (opcional)"
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
            {isLoading ? 'Creando...' : 'Crear Tienda'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateStore