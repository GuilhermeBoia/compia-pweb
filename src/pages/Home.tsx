import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProductModal from "@/components/product-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingCart,
  Filter,
  BookOpen,
  Star,
  Package,
  Heart,
  CheckCircle,
  Code2,
  Terminal,
  Cpu,
  Binary,
  Sparkles,
  TrendingUp,
  Zap,
  Rocket
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function HomePage() {
  const { list } = useProducts();
  const { addToCart, isInCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await list();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => p.categorias.forEach((c) => cats.add(c)));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) =>
        p.categorias.includes(selectedCategory)
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.tipo === selectedType);
    }

    switch (priceRange) {
      case "under50":
        filtered = filtered.filter((p) => p.preco < 50);
        break;
      case "50to100":
        filtered = filtered.filter((p) => p.preco >= 50 && p.preco <= 100);
        break;
      case "100to200":
        filtered = filtered.filter((p) => p.preco > 100 && p.preco <= 200);
        break;
      case "over200":
        filtered = filtered.filter((p) => p.preco > 200);
        break;
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.preco - b.preco);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.preco - a.preco);
        break;
      case "name":
        filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedType,
    sortBy,
    priceRange,
  ]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-20 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Code Elements */}
        <motion.div
          className="absolute top-10 left-10 text-indigo-400 opacity-30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Code2 className="w-12 h-12" />
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-10 text-cyan-400 opacity-30"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Terminal className="w-16 h-16" />
        </motion.div>

        <motion.div
          className="absolute top-20 right-20 text-purple-400 opacity-20"
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Binary className="w-10 h-10" />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Novos livros toda semana</span>
            </motion.div>

            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Biblioteca Digital de Computação
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Domine as tecnologias do futuro com os melhores livros de programação, IA e ciência da computação
            </p>

            {/* Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="Busque por título, autor ou palavra-chave..."
                  className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-xl text-slate-900 border border-white/20 rounded-xl w-full shadow-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  animate={{ opacity: searchTerm ? 1 : 0.5 }}
                >
                  <kbd className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded border border-slate-300">Enter</kbd>
                </motion.div>
              </div>
            </motion.div>

            {/* Browser Animation Section */}
            <motion.div
              className="mt-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 text-indigo-400 opacity-40">
                  <Zap className="w-8 h-8 animate-pulse" />
                </div>
                <div className="absolute -bottom-4 -right-4 text-purple-400 opacity-40">
                  <Rocket className="w-8 h-8 animate-pulse" />
                </div>

              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <motion.div
          className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute -top-3 left-8 px-4 py-1 bg-gradient-to-r from-blue-800 to-slate-700 rounded-full">
            <span className="text-white text-xs font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filtros Inteligentes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="relative bg-white border-slate-200 hover:border-indigo-400 transition-colors">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="relative bg-white border-slate-200 hover:border-purple-400 transition-colors">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="ebook">📱 eBook</SelectItem>
                  <SelectItem value="fisico">📚 Físico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="relative bg-white border-slate-200 hover:border-green-400 transition-colors">
                  <SelectValue placeholder="Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">💰 Qualquer Preço</SelectItem>
                  <SelectItem value="under50">💵 Até R$ 50</SelectItem>
                  <SelectItem value="50to100">💸 R$ 50 - R$ 100</SelectItem>
                  <SelectItem value="100to200">💳 R$ 100 - R$ 200</SelectItem>
                  <SelectItem value="over200">💎 Acima de R$ 200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="relative bg-white border-slate-200 hover:border-cyan-400 transition-colors">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🆕 Mais Recentes</SelectItem>
                  <SelectItem value="price-asc">📉 Menor Preço</SelectItem>
                  <SelectItem value="price-desc">📈 Maior Preço</SelectItem>
                  <SelectItem value="name">🔤 Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200/50">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-medium text-slate-700">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "livro encontrado"
                  : "livros encontrados"}
              </p>
            </div>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 bg-slate-100 rounded-full"
              >
                <span className="text-xs text-slate-600">Buscando: "{searchTerm}"</span>
              </motion.div>
            )}
          </div>
          <motion.div
            className="flex items-center gap-2 text-sm text-slate-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Atualizando em tempo real</span>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-64 bg-slate-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Nenhum livro encontrado
            </h3>
            <p className="text-slate-500">
              Tente ajustar os filtros ou a busca
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={item as Variants}
                  layout
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                    onClick={(e) => handleProductClick(product.id, e)}
                    className="cursor-pointer"
                  >
                    <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-slate-100">
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ margin: '-1px', borderRadius: '12px', padding: '1px' }}>
                        <div className="bg-white h-full w-full rounded-xl" />
                      </div>
                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden z-10">
                        <img
                          src={
                            product.capaUrl ||
                            "https://via.placeholder.com/300x400"
                          }
                          alt={product.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Animated Glow Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
                          <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Badge
                              variant={product.tipo === "ebook" ? "info" : "secondary"}
                              className="backdrop-blur-md bg-white/90  border-white/50 shadow-lg"
                            >
                              {product.tipo === "ebook" ? (
                                <>
                                  <Binary className="w-3 h-3 mr-1" />
                                  Digital
                                </>
                              ) : (
                                <>
                                  <Package className="w-3 h-3 mr-1" />
                                  Físico
                                </>
                              )}
                            </Badge>
                          </motion.div>

                          {product.estoque < 5 && product.estoque > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.2 }}
                            >
                              <Badge
                                variant="destructive"
                                className="backdrop-blur-md bg-red-500/90 text-white border-red-400/50 shadow-lg animate-pulse"
                              >
                                🔥 Últimas {product.estoque} unidades!
                              </Badge>
                            </motion.div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8 backdrop-blur-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative p-4 flex-1 flex flex-col z-10">
                        {/* Title & Author */}
                        <div className="mb-3">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors mb-1">
                            {product.titulo}
                          </h3>
                          {product.autor && (
                            <p className="text-sm text-slate-600">
                              {product.autor}
                            </p>
                          )}
                        </div>

                        {/* Categories */}
                        {product.categorias.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.categorias.slice(0, 2).map((cat) => (
                              <Badge
                                key={cat}
                                variant="outline"
                                className="text-xs"
                              >
                                {cat}
                              </Badge>
                            ))}
                            {product.categorias.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.categorias.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Rating with Animation */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + i * 0.05 }}
                            >
                              <Star
                                className={`w-3 h-3 transition-colors ${
                                  i < 4
                                    ? "fill-yellow-400 text-yellow-400 group-hover:fill-yellow-500"
                                    : "text-slate-300"
                                }`}
                              />
                            </motion.div>
                          ))}
                          <span className="text-xs text-slate-600 ml-1 font-medium">
                            4.5
                          </span>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Price & Action */}
                        <div className="space-y-3 mt-auto">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-slate-900">
                              {product.preco.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                            {product.estoque > 0 && (
                              <span className="text-xs text-slate-600">
                                {product.estoque} em estoque
                              </span>
                            )}
                          </div>

                          {product.estoque > 0 ? (
                            isInCart(product.id) ? (
                              <Button
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                No Carrinho
                              </Button>
                            ) : (
                              <Button
                                className="w-full bg-gradient-to-r from-blue-800 to-slate-700 hover:from-blue-700 hover:to-slate-700 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02] group/btn"
                                onClick={(e) => handleAddToCart(product, e)}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                Adicionar ao Carrinho
                              </Button>
                            )
                          ) : (
                            <Button
                              className="w-full bg-slate-200 text-slate-400 cursor-not-allowed"
                              disabled
                            >
                              Indisponível
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
