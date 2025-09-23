import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '@/hooks/use-products'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  PlusCircle,
  Search,
  Filter,
  BookOpen,
  Code2,
  Binary,
  Cpu,
  Database,
  Terminal,
  Trash2,
  Edit,
  MoreVertical,
  Package,
  FileText,
  CircuitBoard,
  Bot,
  Braces,
  ShoppingCart
} from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  'algoritmos': <Binary className="w-4 h-4" />,
  'programação': <Code2 className="w-4 h-4" />,
  'dados': <Database className="w-4 h-4" />,
  'sistemas': <Cpu className="w-4 h-4" />,
  'ia': <Bot className="w-4 h-4" />,
  'web': <CircuitBoard className="w-4 h-4" />,
  'default': <BookOpen className="w-4 h-4" />
}

const getCategoryIcon = (category: string) => {
  const key = category.toLowerCase()
  return categoryIcons[key] || categoryIcons['default']
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
}

export default function ProductsPage() {
  const { list, getCapaUrl, remove } = useProducts()
  const [items, setItems] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const totalBooks = items.length
  const totalEbooks = items.filter(p => p.tipo === 'ebook').length
  const totalFisicos = items.filter(p => p.tipo === 'fisico').length
  // Valor Total agora é a soma dos preços dos livros (não multiplicado pelo estoque)
  const totalValor = items.reduce((acc, p) => acc + p.preco, 0)

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list])

  const loadProducts = async () => {
    setLoading(true)
    const data = await list()
    setItems(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    await loadProducts()
    setDeleteId(null)
  }

  const filteredItems = items.filter(p =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categorias.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="absolute inset-0 bg-white/50 opacity-20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-8 h-8 text-slate-700" />
            <h1 className="text-4xl font-bold text-slate-900">
              Catálogo
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por título, autor ou categoria..."
                className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>

              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                <Link to="/catalogo/novo">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Novo Livro
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <BookOpen className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Total de Livros</p>
                <p className="text-2xl font-bold text-slate-900">{totalBooks}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <FileText className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">eBooks</p>
                <p className="text-2xl font-bold text-slate-900">{totalEbooks}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Package className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Físicos</p>
                <p className="text-2xl font-bold text-slate-900">{totalFisicos}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <ShoppingCart className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-white border-slate-200 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-48 bg-slate-700 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-slate-700 rounded w-full"></div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Braces className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Nenhum livro encontrado
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro livro'}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                <Link to="/catalogo/novo">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar Livro
                </Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  getCapaUrl={getCapaUrl}
                  onDelete={() => setDeleteId(product.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-slate-900 border-slate-200 hover:bg-slate-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProductCard({
  product,
  getCapaUrl,
  onDelete
}: {
  product: Product
  getCapaUrl: (p: Product) => Promise<string | undefined>
  onDelete: () => void
}) {
  const [capa, setCapa] = useState<string | undefined>()
  const [hovering, setHovering] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      const url = await getCapaUrl(product)
      setCapa(url)
    })()
  }, [product, getCapaUrl])

  const stockColor = product.estoque > 10 ? 'success' : product.estoque > 0 ? 'warning' : 'destructive'

  function handleCardClick() {
    navigate(`/catalogo/${product.id}`)
  }

  return (
    <motion.div
      variants={item}
      layout
      whileHover={{ y: -8 }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
    >
      <Card
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
        className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col group rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-800"
      >
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
          {capa ? (
            <motion.img
              src={capa}
              alt={product.titulo}
              className="w-full h-full object-cover"
              animate={{ scale: hovering ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-slate-300" />
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-2">
            <Badge
              variant={product.tipo === 'ebook' ? 'info' : 'success'}
              className="backdrop-blur"
            >
              {product.tipo === 'ebook' ? 'eBook' : 'Físico'}
            </Badge>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors text-lg">
                {product.titulo}
              </h3>
              {product.autor && (
                <p className="text-sm text-slate-600 mt-1">{product.autor}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button onClick={(e) => e.stopPropagation()} variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                <DropdownMenuItem asChild className="text-slate-700 hover:text-slate-900 focus:bg-slate-100">
                  <Link to={`/catalogo/${product.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 hover:text-red-700 focus:bg-red-50"
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {product.categorias.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="outline" className="border-slate-300 text-slate-600 text-xs">
                {getCategoryIcon(cat)}
                <span className="ml-1">{cat}</span>
              </Badge>
            ))}
            {product.categorias.length > 3 && (
              <Badge variant="outline" className="border-slate-300 text-slate-500 text-xs">
                +{product.categorias.length - 3}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardFooter className="pt-0 flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <Badge variant={stockColor as "success" | "warning" | "destructive"} className="mt-1">
              {product.estoque} em estoque
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}