import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-xl font-black tracking-tight">
            COMPIA<span className="text-slate-400">.store</span>
          </Link>          
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
    </div>
  )
}
