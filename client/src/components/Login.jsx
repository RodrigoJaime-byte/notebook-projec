import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('Completa todos los campos')
      return
    }

    const result = onLogin(username, password)
    
    if (!result.success) {
      setError(result.message)
      setPassword('')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📔 The Notebook</h1>
        <p>Sistema de Cuentas</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />
          </div>

          <div>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit">Entrar</button>
        </form>

        <div className="demo">
          <p><strong>Usuario:</strong> admin</p>
          <p><strong>Contraseña:</strong> 123456</p>
        </div>
      </div>
    </div>
  )
}

export default Login