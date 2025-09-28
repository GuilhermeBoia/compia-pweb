import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import Cart from '@/components/cart'
import UserAvatar from '@/components/avatar'
import { ShoppingCart, Package, History, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Layout() {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const totalItems = getTotalItems()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Listen for force close cart event
  useEffect(() => {
    const handleForceCloseCart = () => {
      setIsCartOpen(false)
    }

    window.addEventListener('force-close-cart', handleForceCloseCart)
    
    return () => {
      window.removeEventListener('force-close-cart', handleForceCloseCart)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg md:text-xl font-black tracking-tight">
            <img
              src="/compia.svg"
              alt="Compia Logo"
              className="hidden md:block w-8 h-8"
            />
            <span>COMPIA<span className="text-slate-400">.store</span></span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {user?.role === 'admin' ? (
              <>
                <Link
                  to="/catalogo"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Catálogo</span>
                </Link>
                <Link
                  to="/gestao-pedidos"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span className="hidden sm:inline">Pedidos</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/historico-compras"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </Link>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-slate-900 text-white text-xs"
                      variant="default"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </button>
              </>
            )}

            {user ? (
              <>
                <UserAvatar user={user} />
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-500 flex flex-wrap items-center gap-2">
          <span>© {new Date().getFullYear()} COMPIA Editora</span>
          <span className="mx-2">•</span>
          <a className="hover:underline" href="#">Termos</a>
          <span className="mx-2">•</span>
          <a className="hover:underline" href="#">Privacidade</a>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
