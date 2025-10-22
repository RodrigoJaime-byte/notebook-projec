import { useState, useEffect } from 'react'
import CreateStore from './CreateStore'
import CreateCustomer from './CreateCustomer'
import AddPurchase from './AddPurchase'
import CloseAccount from './CloseAccount'
import CustomerPurchases from './CustomerPurchases'
import ExportData from './ExportData'
import Reports from './Reports'

function Dashboard({ 
  user, 
  store, 
  customers, 
  purchases, 
  onLogout, 
  onCreateStore, 
  onCreateCustomer, 
  onAddPurchase, 
  onCloseAccount, 
  stores,
  onResetDemo
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [menuOpen, setMenuOpen] = useState(false)

  // Detectar cambios en el tamaño de la ventana para responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Si es admin y no tiene tienda, mostrar crear tienda
  if (user.role === 'admin' && !store) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="brand">
              <div className="app-logo">📔</div>
              <h1>The Notebook</h1>
            </div>
            <div className="header-actions">
              <button onClick={onResetDemo} className="btn-outline" title="Restablecer Demo">
                <span className="btn-icon">♻️</span>
                <span className="btn-text">Restablecer</span>
              </button>
              <button onClick={onLogout} className="btn-danger" title="Cerrar Sesión">
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Salir</span>
              </button>
            </div>
          </div>
        </header>
        <div className="setup-container">
          <CreateStore onCreateStore={onCreateStore} existingStores={stores} />
        </div>
      </div>
    )
  }

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview store={store} customers={customers} purchases={purchases} />
      case 'customers':
        return <CreateCustomer onCreateCustomer={onCreateCustomer} customers={customers} />
      case 'purchases':
        return <AddPurchase customers={customers} purchases={purchases} onAddPurchase={onAddPurchase} />
      case 'close':
        return <CloseAccount customers={customers} purchases={purchases} onCloseAccount={onCloseAccount} />
      case 'reports':
        return <Reports customers={customers} purchases={purchases} />
      case 'export':
        return <ExportData customers={customers} purchases={purchases} />
      default:
        return <AdminOverview store={store} customers={customers} purchases={purchases} />
    }
  }

  const renderCustomerContent = () => {
    return <CustomerPurchases purchases={purchases} user={user} />
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (isMobile) {
      setMenuOpen(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            {isMobile && (
              <button 
                className="menu-toggle" 
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            )}
            <div className="user-name-section">
              <span className="store-icon">🏪</span>
              <span className="user-name-large">{user.name}</span>
            </div>
            <div className="header-info">
              <h1>{store?.name || 'The Notebook'}</h1>
            </div>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="role-badge">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
            </div>
            <div className="header-actions">
              <button onClick={onResetDemo} className="btn-outline" title="Restablecer Demo">
                <span className="btn-icon">♻️</span>
                <span className="btn-text">Restablecer</span>
              </button>
              <button onClick={onLogout} className="btn-danger" title="Cerrar Sesión">
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {user.role === 'admin' && (
        <nav className={`dashboard-nav ${isMobile ? (menuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Resumen</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => handleTabChange('customers')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Clientes</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => handleTabChange('purchases')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-text">Compras</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'close' ? 'active' : ''}`}
            onClick={() => handleTabChange('close')}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">Cerrar Cuentas</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleTabChange('reports')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reportes</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => handleTabChange('export')}
          >
            <span className="nav-icon">📥</span>
            <span className="nav-text">Exportar Datos</span>
          </button>
        </nav>
      )}

      <main className="dashboard-content">
        {user.role === 'admin' ? renderAdminContent() : renderCustomerContent()}
      </main>
    </div>
  )
}

// Componente de resumen para admin
function AdminOverview({ store, customers, purchases }) {
  // Cálculo seguro del mes actual en zona horaria local (YYYY-MM)
  const getLocalYearMonth = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  const currentMonth = getLocalYearMonth()

  // Filtro local para actividad reciente
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  // Meses disponibles (ordenados descendente)
  const months = Array.from(new Set(purchases.map(p => p.month))).sort((a, b) => b.localeCompare(a))

  // Formateo consistente de dinero a 2 decimales
  const formatMoney = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  
  // Etiquetas y estilos de estado
  const statusLabel = { open: 'Abierto', closed: 'Cerrado', paid: 'Pagado' }
  const statusStyle = {
    open:  { backgroundColor: '#fef3c7', color: '#92400e' },   // amarillo suave
    closed:{ backgroundColor: '#e5e7eb', color: '#374151' },   // gris
    paid:  { backgroundColor: '#dcfce7', color: '#166534' },   // verde
  }
  
  const monthlyStats = {
    totalCustomers: customers.length,
    activeAccounts: purchases.filter(p => p.month === currentMonth && p.status === 'open').length,
    monthlyRevenue: purchases
      .filter(p => p.month === currentMonth)
      .reduce((sum, p) => sum + p.total, 0),
    pendingBalance: purchases
      .filter(p => p.status === 'closed' && p.balanceDue > 0)
      .reduce((sum, p) => sum + p.balanceDue, 0)
  }

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h2 className="section-title">Resumen del Negocio</h2>
        <p className="current-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon customers-icon">👥</div>
          <div className="stat-content">
            <h3>Clientes Totales</h3>
            <p className="stat-number">{monthlyStats.totalCustomers}</p>
            <div className="stat-trend positive">
              <span className="trend-icon">↗</span> Activo
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon accounts-icon">📖</div>
          <div className="stat-content">
            <h3>Cuentas Activas</h3>
            <p className="stat-number">{monthlyStats.activeAccounts}</p>
            <div className="stat-trend neutral">
              <span className="trend-icon">→</span> Estable
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon sales-icon">💰</div>
          <div className="stat-content">
            <h3>Ventas del Mes</h3>
            <p className="stat-number">{formatMoney(monthlyStats.monthlyRevenue)}</p>
            <div className="stat-trend positive">
              <span className="trend-icon">↗</span> Creciendo
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending-icon">⏳</div>
          <div className="stat-content">
            <h3>Saldo Pendiente</h3>
            <p className="stat-number">{formatMoney(monthlyStats.pendingBalance)}</p>
            <div className="stat-trend negative">
              <span className="trend-icon">↘</span> Por cobrar
            </div>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">📋</span> Actividad Reciente
          </h2>
          
          <div className="filters-bar">
            <div className="filter-group">
              <label className="filter-label">Cliente</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="form-select"
              >
                <option value="">Todos los clientes</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Mes</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select"
              >
                <option value="">
                  Actual ({new Date(`${currentMonth}-01`).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })})
                </option>
                {months.map(m => (
                  <option key={m} value={m}>
                    {new Date(`${m}-01`).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="activity-list">
          {purchases
            .filter(p => (selectedMonth ? p.month === selectedMonth : p.month === currentMonth))
            .filter(p => (selectedCustomer ? p.customerId === Number(selectedCustomer) : true))
            .slice(-5)
            .reverse()
            .map(purchase => {
              const customer = customers.find(c => c.id === purchase.customerId)
              return (
                <div key={purchase.id} className="activity-item">
                  <div className="activity-date">
                    {new Date(`${purchase.month}-01`).toLocaleDateString('es-ES', { month: 'short' })}
                  </div>
                  <div className="activity-info">
                    <div className="activity-customer">{customer?.name}</div>
                    <div className="activity-detail">
                      <span className="item-count">{purchase.items.length} productos</span>
                      <span className="item-total">{formatMoney(purchase.total)}</span>
                    </div>
                  </div>
                  <div className={`status-badge status-${purchase.status}`}>
                    {statusLabel[purchase.status] || 'Estado'}
                  </div>
                </div>
              )
            })}
            
          {purchases
            .filter(p => (selectedMonth ? p.month === selectedMonth : p.month === currentMonth))
            .filter(p => (selectedCustomer ? p.customerId === Number(selectedCustomer) : true))
            .length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>No hay actividad para mostrar con los filtros seleccionados</p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard