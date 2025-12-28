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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header 
        onAdminClick={handleAdminAccess}
        onLogoClick={handleBackToCatalog}
        onCartClick={() => setIsCartOpen(true)}
        showBackButton={currentView === 'restaurant'}
        onBackClick={handleBackToCatalog}
      />
      
      <div className="flex-1">
        {currentView === 'catalog' && (
          <RestaurantCatalog onRestaurantSelect={handleRestaurantSelect} />
        )}
        
        {currentView === 'restaurant' && selectedRestaurantId && (
          <RestaurantDetail restaurantId={selectedRestaurantId} />
        )}
        
        {currentView === 'admin' && (
          <AdminPanel onBack={handleBackFromAdmin} />
        )}
      </div>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="font-body text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Imperial Delicious Menu. Curated dining for the high seas.
          </p>
          <a 
            href="/CHANGELOG.md" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs sm:text-sm text-accent hover:text-accent/80 transition-colors underline underline-offset-2"
          >
            Updates & Documentation
          </a>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <ConciergeOrderButton />
      
      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}

export default App