import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-slate-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Página não encontrada
        </h1>
        <p className="text-slate-600 mb-8 max-w-md">
          A página que você está procurando não existe ou foi movida para outro local.
        </p>
        <Link
          to="/"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}
