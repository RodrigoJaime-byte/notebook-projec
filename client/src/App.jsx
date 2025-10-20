import { useState, useEffect } from 'react'
import './App.css'

// Componentes
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Datos simulados (luego vendrán del backend)
  const [stores, setStores] = useState([])
  const [users, setUsers] = useState([
    { 
      id: 1, 
      username: "admin", 
      password: "123456", 
      role: "admin", 
      storeId: null,
      name: "Administrador Principal"
    }
  ])
  
  const [purchases, setPurchases] = useState([])

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('notebook_user')
    const savedStores = localStorage.getItem('notebook_stores')
    const savedUsers = localStorage.getItem('notebook_users')
    const savedPurchases = localStorage.getItem('notebook_purchases')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
    if (savedStores) setStores(JSON.parse(savedStores))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases))
  }, [])

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('notebook_stores', JSON.stringify(stores))
  }, [stores])

  useEffect(() => {
    localStorage.setItem('notebook_users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('notebook_purchases', JSON.stringify(purchases))
  }, [purchases])

  // Función de login
  const handleLogin = (username, password) => {
    const foundUser = users.find(u => u.username === username && u.password === password)
    
    if (foundUser) {
      setUser(foundUser)
      setIsAuthenticated(true)
      localStorage.setItem('notebook_user', JSON.stringify(foundUser))
      return { success: true }
    }
    return { success: false, message: 'Usuario o contraseña incorrectos' }
  }

  // Función de logout
  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('notebook_user')
  }

  // Crear tienda (solo admin; permitir si storeId existe pero la tienda no está en la lista)
  const createStore = (storeName) => {
    if (user.role !== 'admin') return false

    const existingStore = stores.find(s => s.id === user.storeId)
    if (user.storeId && existingStore) return false

    const newStore = {
      id: Date.now(),
      name: storeName,
      adminId: user.id,
      createdAt: new Date().toISOString()
    }

    const updatedUser = { ...user, storeId: newStore.id }
    
    setStores([...stores, newStore])
    setUsers(users.map(u => u.id === user.id ? updatedUser : u))
    setUser(updatedUser)
    localStorage.setItem('notebook_user', JSON.stringify(updatedUser))
    
    return true
  }

  // Crear cliente
  const createCustomer = (customerData) => {
    if (user.role !== 'admin' || !user.storeId) return false

    const newCustomer = {
      id: Date.now(),
      username: customerData.username,
      password: customerData.password,
      role: "customer",
      storeId: user.storeId,
      name: customerData.name,
      createdAt: new Date().toISOString()
    }

    setUsers([...users, newCustomer])
    return true
  }

  // Agregar compra
  const addPurchase = (customerId, purchaseData) => {
    if (user.role !== 'admin') return false

    const currentMonth = new Date().toISOString().substring(0, 7) // "2024-01"

    // Validar y normalizar monto
    const amountNum = Number(purchaseData.amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) return false
    const normalizedAmount = Math.round(amountNum * 100) / 100

    // Asegurar fecha
    const purchaseDate = purchaseData.date || new Date().toISOString().split('T')[0]

    // Buscar si ya existe un documento de compras para este cliente y mes (abierto)
    let monthlyPurchase = purchases.find(p => 
      p.customerId === customerId && 
      p.month === currentMonth &&
      p.status === 'open'
    )

    const newItem = {
      id: Date.now(),
      date: purchaseDate,
      product: purchaseData.product,
      amount: normalizedAmount
    }

    if (monthlyPurchase) {
      // Agregar item al mes existente con redondeo
      const updatedTotal = Math.round((monthlyPurchase.total + normalizedAmount) * 100) / 100
      const updatedBalanceDue = Math.round((updatedTotal + monthlyPurchase.carryOver) * 100) / 100

      const updatedPurchase = {
        ...monthlyPurchase,
        items: [...monthlyPurchase.items, newItem],
        total: updatedTotal,
        balanceDue: updatedBalanceDue
      }
      
      setPurchases(purchases.map(p => 
        p.id === monthlyPurchase.id ? updatedPurchase : p
      ))
    } else {
      // Crear nuevo documento mensual
      const newMonthlyPurchase = {
        id: Date.now(),
        customerId: customerId,
        storeId: user.storeId,
        month: currentMonth,
        items: [newItem],
        total: normalizedAmount,
        carryOver: 0,
        status: 'open', // 'open', 'closed', 'paid'
        balanceDue: normalizedAmount,
        createdAt: new Date().toISOString()
      }

      // Verificar si hay saldo pendiente del mes anterior
      const previousMonth = getPreviousMonth(currentMonth)
      const previousPurchase = purchases.find(p => 
        p.customerId === customerId && 
        p.month === previousMonth &&
        p.status === 'closed' &&
        p.balanceDue > 0
      )

      if (previousPurchase) {
        const carryOver = Math.round(previousPurchase.balanceDue * 100) / 100
        newMonthlyPurchase.carryOver = carryOver
        newMonthlyPurchase.balanceDue = Math.round((newMonthlyPurchase.total + carryOver) * 100) / 100
      }

      setPurchases([...purchases, newMonthlyPurchase])
    }

    return true
  }

  // Cerrar cuenta mensual
  const closeAccount = (customerId, month, paidAmount = 0) => {
    if (user.role !== 'admin') return false

    const monthlyPurchase = purchases.find(p => 
      p.customerId === customerId && 
      p.month === month &&
      p.status === 'open'
    )

    if (!monthlyPurchase) return false

    // Validar pago
    const paid = Number(paidAmount)
    if (!Number.isFinite(paid) || paid < 0) return false

    const totalDue = Math.round((monthlyPurchase.total + monthlyPurchase.carryOver) * 100) / 100
    const remainingBalance = Math.max(0, Math.round((totalDue - paid) * 100) / 100)

    const updatedPurchase = {
      ...monthlyPurchase,
      status: remainingBalance === 0 ? 'paid' : 'closed',
      balanceDue: remainingBalance,
      paidAmount: Math.round(paid * 100) / 100,
      closedAt: new Date().toISOString()
    }

    setPurchases(purchases.map(p => 
      p.id === monthlyPurchase.id ? updatedPurchase : p
    ))

    return true
  }

  // Función auxiliar para resetear la demo
  const resetDemo = () => {
    localStorage.clear()
    window.location.reload()
  }

  // Función auxiliar para obtener el mes anterior
  const getPreviousMonth = (month) => {
    const date = new Date(month + '-01')
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().substring(0, 7)
  }

  // Obtener datos según el rol
  const getStoreData = () => {
    if (!user || !user.storeId) return null
    return stores.find(s => s.id === user.storeId)
  }

  const getCustomers = () => {
    if (user.role !== 'admin' || !user.storeId) return []
    return users.filter(u => u.role === 'customer' && u.storeId === user.storeId)
  }

  const getCustomerPurchases = () => {
    if (user.role !== 'customer') return []
    return purchases.filter(p => p.customerId === user.id).sort((a, b) => b.month.localeCompare(a.month))
  }

  const getStorePurchases = () => {
    if (user.role !== 'admin' || !user.storeId) return []
    return purchases.filter(p => p.storeId === user.storeId)
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard 
          user={user}
          store={getStoreData()}
          customers={getCustomers()}
          purchases={user.role === 'admin' ? getStorePurchases() : getCustomerPurchases()}
          stores={stores}
          onLogout={handleLogout}
          onCreateStore={createStore}
          onCreateCustomer={createCustomer}
          onAddPurchase={addPurchase}
          onCloseAccount={closeAccount}
          onResetDemo={resetDemo}
        />
      )}
    </div>
  )
}

export default App
