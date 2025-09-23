import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '@/hooks/use-products'
import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  ShoppingCart,
  Heart, Star,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  User,
  Tag,
  Hash
} from 'lucide-react'

interface ProductModalProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ productId, isOpen, onClose }: ProductModalProps) {
  const { getById } = useProducts()
  const { addToCart, isInCart, getCartItem, updateQuantity } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return

      setLoading(true)
      try {
        const data = await getById(productId)
        if (data) {
          setProduct(data)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId && isOpen) {
      loadProduct()
    } else {
      setProduct(null)
      setSelectedImage(0)
      setQuantity(1)
    }
  }, [productId, isOpen, getById])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      setQuantity(1)
    }
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!product) return
    const cartItem = getCartItem(product.id)
    if (cartItem) {
      updateQuantity(product.id, newQuantity)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const allImages = product ? [product.capaUrl, ...(product.imageUrls || [])].filter(Boolean) : []
  const cartItem = product ? getCartItem(product.id) : null
  const inCart = product ? isInCart(product.id) : false

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                </div>
              ) : product ? (
                <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
                  {/* Image Section */}
                  <div className="bg-slate-50 p-6">
                    <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden mb-4">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={selectedImage}
                          src={allImages[selectedImage] || 'https://via.placeholder.com/400x600'}
                          alt={product.titulo}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </AnimatePresence>
                    </div>

                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {allImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`
                              flex-shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition-all
                              ${selectedImage === index ? 'border-slate-900' : 'border-transparent'}
                            `}
                          >
                            <img
                              src={img || 'https://via.placeholder.com/100x140'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col">

                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={product.tipo === 'ebook' ? 'default' : 'secondary'}>
                          {product.tipo === 'ebook' ? (
                            <>
                              <FileText className="w-3 h-3 mr-1" />
                              eBook
                            </>
                          ) : (
                            <>
                              <Package className="w-3 h-3 mr-1" />
                              Físico
                            </>
                          )}
                        </Badge>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors" onClick={onClose}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{product.titulo}</h2>

                      {product.autor && (
                        <div className="flex items-center gap-2 text-slate-600 mb-3">
                          <User className="w-4 h-4" />
                          <span>{product.autor}</span>
                        </div>
                      )}

                      {/* Rating */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">4.5 (127 avaliações)</span>
                      </div>
                    </div>

                    {/* Price & Stock */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-3xl font-bold text-slate-900">
                          {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        {product.tipo === 'fisico' && (
                          <span className="text-sm text-slate-600">+ frete</span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center gap-2">
                        {product.estoque > 0 ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Em estoque</span>
                            <span className="text-slate-600 text-sm">({product.estoque} disponíveis)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">Fora de estoque</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Add to Cart */}
                    {product.estoque > 0 && (
                      <div className="space-y-3 mb-4">
                        {inCart ? (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-slate-300 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity((cartItem?.quantity || 1) - 1)}
                                className="p-2 hover:bg-slate-100 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 font-medium">{cartItem?.quantity || 0}</span>
                              <button
                                onClick={() => handleUpdateQuantity((cartItem?.quantity || 1) + 1)}
                                disabled={cartItem?.quantity === product.estoque}
                                className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              No carrinho
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-slate-300 rounded-lg">
                              <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 hover:bg-slate-100 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 font-medium">{quantity}</span>
                              <button
                                onClick={() => setQuantity(Math.min(product.estoque, quantity + 1))}
                                disabled={quantity === product.estoque}
                                className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <Button
                              size="lg"
                              className="flex-1 bg-slate-900 hover:bg-slate-800"
                              onClick={handleAddToCart}
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Adicionar ao Carrinho
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Categories & Tags */}
                    <div className="space-y-2 mb-4">
                      {product.categorias.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="w-4 h-4 text-slate-500" />
                          {product.categorias.map(cat => (
                            <Badge key={cat} variant="outline">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {product.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Hash className="w-4 h-4 text-slate-500" />
                          {product.tags.map(tag => (
                            <span key={tag} className="text-sm text-slate-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {product.descricao && (
                      <div className="mt-auto pt-4 border-t">
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">Descrição</h3>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {product.descricao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}