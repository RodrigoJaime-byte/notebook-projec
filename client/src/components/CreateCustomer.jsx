import { useState } from 'react'

function CreateCustomer({ onCreateCustomer, existingUsers }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validaciones básicas
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres')
      setIsLoading(false)
      return
    }

    if (password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres')
      setIsLoading(false)
      return
    }

    // Verificar si el usuario ya existe
    if (existingUsers.some(user => user.username === username.trim())) {
      setError('Este nombre de usuario ya existe')
      setIsLoading(false)
      return
    }

    // Llamar a la función de creación
    const result = onCreateCustomer({
      name: name.trim(),
      username: username.trim(),
      password: password.trim()
    })

    if (result) {
      setSuccess('Cliente creado exitosamente')
      setName('')
      setUsername('')
      setPassword('')
      
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError('Error al crear el cliente')
    }

    setIsLoading(false)
  }

  const resetForm = () => {
    setName('')
    setUsername('')
    setPassword('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>👤 Crear Cliente</h2>
        <p>Registra un nuevo cliente en tu tienda</p>
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
          <label htmlFor="name">Nombre Completo *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Usuario *</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: juan123"
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña *</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 3 caracteres"
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
            {isLoading ? 'Creando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCustomer