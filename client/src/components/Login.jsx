import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    if (!username || !password) {
      setError('Por favor, completa todos los campos')
      setIsLoading(false)
      return
    }

    // Pequeño retraso para simular carga
    setTimeout(() => {
      const result = onLogin(username, password)
      
      if (!result.success) {
        setError(result.message)
        setPassword('')
      }
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="app-logo">📔</div>
          <h1>The Notebook</h1>
          <p className="app-subtitle">Sistema de Gestión de Tiendas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuario</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
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
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Credenciales de Demostración</h3>
          <div className="credential-item">
            <span className="credential-label">Usuario:</span>
            <span className="credential-value">admin</span>
          </div>
          <div className="credential-item">
            <span className="credential-label">Contraseña:</span>
            <span className="credential-value">123456</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login