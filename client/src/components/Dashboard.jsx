import { useState } from 'react'
import CreateStore from './CreateStore'
import CreateCustomer from './CreateCustomer'
import AddPurchase from './AddPurchase'
import CloseAccount from './CloseAccount'
import CustomerPurchases from './CustomerPurchases'

function Dashboard({ 
  user, 
  store, 
  customers, 
  purchases, 
  onLogout, 
  onCreateStore, 
  onCreateCustomer, 
  onAddPurchase, 
  onCloseAccount 
}) {
  const [activeTab, setActiveTab] = useState('overview')

  // Si es admin y no tiene tienda, mostrar crear tienda
  if (user.role === 'admin' && !store) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>📔 The Notebook</h1>
            <button onClick={onLogout} className="logout-btn">
              🚪 Salir
            </button>
          </div>
        </header>
        <CreateStore onCreateStore={onCreateStore} />
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
        return <AddPurchase customers={customers} onAddPurchase={onAddPurchase} />
      case 'close':
        return <CloseAccount customers={customers} purchases={purchases} onCloseAccount={onCloseAccount} />
      default:
        return <AdminOverview store={store} customers={customers} purchases={purchases} />
    }
  }

  const renderCustomerContent = () => {
    return <CustomerPurchases purchases={purchases} user={user} />
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>🏪 {store?.name || 'The Notebook'}</h1>
            <p>{user.role === 'admin' ? 'Panel de Administración' : 'Mi Cuenta'} - {user.name}</p>
          </div>
          <button onClick={onLogout} className="logout-btn">
            🚪 Salir
          </button>
        </div>
      </header>

      {user.role === 'admin' && (
        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Resumen
          </button>
          <button 
            className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            👥 Clientes
          </button>
          <button 
            className={`nav-btn ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            🛒 Compras
          </button>
          <button 
            className={`nav-btn ${activeTab === 'close' ? 'active' : ''}`}
            onClick={() => setActiveTab('close')}
          >
            💰 Cerrar Cuentas
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
  const currentMonth = new Date().toISOString().substring(0, 7)
  
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
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Clientes Totales</h3>
            <p className="stat-number">{monthlyStats.totalCustomers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>Cuentas Activas</h3>
            <p className="stat-number">{monthlyStats.activeAccounts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ventas del Mes</h3>
            <p className="stat-number">${monthlyStats.monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Saldo Pendiente</h3>
            <p className="stat-number">${monthlyStats.pendingBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>📋 Actividad Reciente</h2>
        <div className="activity-list">
          {purchases
            .filter(p => p.month === currentMonth)
            .slice(-5)
            .reverse()
            .map(purchase => {
              const customer = customers.find(c => c.id === purchase.customerId)
              return (
                <div key={purchase.id} className="activity-item">
                  <div className="activity-info">
                    <strong>{customer?.name}</strong>
                    <span className="activity-detail">
                      {purchase.items.length} compras - ${purchase.total.toLocaleString()}
                    </span>
                  </div>
                  <span className={`status-badge ${purchase.status}`}>
                    {purchase.status === 'open' ? 'Abierto' : 
                     purchase.status === 'closed' ? 'Cerrado' : 'Pagado'}
                  </span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard