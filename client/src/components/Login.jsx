import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    const result = onLogin(username.trim(), password)
    
    if (!result.success) {
      setError(result.message)
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">📔</div>
          <h1>The Notebook</h1>
          <p>Sistema de Cuentas por Cobrar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Iniciando...' : '🔑 Iniciar Sesión'}
          </button>
        </form>

        <div className="demo-section">
          <h3>👥 Usuarios de Prueba</h3>
          <div className="demo-users">
            <div className="demo-user">
              <span className="role-badge admin">Admin</span>
              <strong>admin</strong> / 123
            </div>
          </div>
          <p className="demo-note">
            💡 El admin puede crear su tienda y clientes
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login