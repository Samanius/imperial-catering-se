import { useState } from 'react'
import Header from './components/Header'
import RestaurantCatalog from './components/RestaurantCatalog'
import RestaurantDetail from './components/RestaurantDetail'
import AdminPanel from './components/AdminPanel'
import CartDrawer from './components/CartDrawer'
import ConciergeOrderButton from './components/ConciergeOrderButton'
import { Toaster } from './components/ui/sonner'

function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'restaurant' | 'admin'>('catalog')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleRestaurantSelect = (id: string) => {
    setSelectedRestaurantId(id)
    setCurrentView('restaurant')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToCatalog = () => {
    setCurrentView('catalog')
    setSelectedRestaurantId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdminAccess = () => {
    setCurrentView('admin')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromAdmin = () => {
    setCurrentView('catalog')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onAdminClick={handleAdminAccess}
        onLogoClick={handleBackToCatalog}
        onCartClick={() => setIsCartOpen(true)}
        showBackButton={currentView === 'restaurant'}
        onBackClick={handleBackToCatalog}
      />
      
      {currentView === 'catalog' && (
        <RestaurantCatalog onRestaurantSelect={handleRestaurantSelect} />
      )}
      
      {currentView === 'restaurant' && selectedRestaurantId && (
        <RestaurantDetail restaurantId={selectedRestaurantId} />
      )}
      
      {currentView === 'admin' && (
        <AdminPanel onBack={handleBackFromAdmin} />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <ConciergeOrderButton />
      
      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}

export default App