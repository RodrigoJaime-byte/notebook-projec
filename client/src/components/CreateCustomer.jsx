import { useState, useEffect } from 'react'

function CreateCustomer({ onCreateCustomer, customers = [] }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Evaluar la fortaleza de la contraseña
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    
    // Longitud mínima
    if (password.length >= 3) strength += 1
    if (password.length >= 6) strength += 1
    
    // Complejidad
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    setPasswordStrength(Math.min(strength, 5))
  }, [password])

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
    if (customers.some(user => user.username === username.trim())) {
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
      setPasswordStrength(0)
      
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
    setPasswordStrength(0)
  }

  // Función para generar el texto de fortaleza de contraseña
  const getStrengthText = () => {
    if (!password) return '';
    const texts = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Excelente'];
    return texts[passwordStrength];
  }

  return (
    <div className="create-customer-container">
      <div className="form-card">
        <div className="form-header">
          <div className="form-icon">👤</div>
          <h2>Crear Cliente</h2>
          <p>Registra un nuevo cliente en tu tienda</p>
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
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
            <label htmlFor="name" className="form-label">Nombre Completo</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del cliente"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Nombre de Usuario</label>
            <div className="input-with-icon">
              <span className="input-icon">🔤</span>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario para iniciar sesión"
                disabled={isLoading}
                required
                minLength={3}
              />
            </div>
            <small className="form-hint">Mínimo 3 caracteres, debe ser único</small>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña segura"
                disabled={isLoading}
                required
                minLength={3}
              />
            </div>
            
            {password && (
              <>
                <div className="password-strength">
                  <div className={`strength-segment ${passwordStrength >= 1 ? 'active' : ''}`}></div>
                  <div className={`strength-segment ${passwordStrength >= 2 ? 'active' : ''}`}></div>
                  <div className={`strength-segment ${passwordStrength >= 3 ? 'active' : ''}`}></div>
                  <div className={`strength-segment ${passwordStrength >= 4 ? 'active' : ''}`}></div>
                  <div className={`strength-segment ${passwordStrength >= 5 ? 'active' : ''}`}></div>
                </div>
                <small className={`strength-text strength-${passwordStrength}`}>
                  {getStrengthText()}
                </small>
              </>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={resetForm} 
              className="btn-outline"
              disabled={isLoading}
            >
              Limpiar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="customer-list-section">
        <div className="list-header">
          <h3>Clientes Registrados</h3>
        </div>
        <div className="customer-list">
          {customers.length > 0 ? (
            customers.map(customer => (
              <div key={customer.id} className="customer-item">
                <div className="customer-avatar">{customer.name.charAt(0).toUpperCase()}</div>
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-username">@{customer.username}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-list">
              <div className="empty-icon">🔍</div>
              <p>No hay clientes registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCustomer;