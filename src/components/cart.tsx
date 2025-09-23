import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/product-modal";
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Package,
  FileText,
  ArrowRight,
} from "lucide-react";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCart();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductModalOpen(true);
    onClose(); // Close the cart when opening product modal
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Cart Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-start justify-between border-b px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Carrinho de Compras
                    </h2>
                    {totalItems > 0 && (
                      <Badge variant="secondary">{totalItems}</Badge>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">
                        Seu carrinho está vazio
                      </p>
                      <Button onClick={onClose} variant="outline">
                        Continuar Comprando
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {items.map((item) => (
                          <motion.div
                            key={item.product.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex gap-4 border-b pb-4"
                          >
                            <div
                              onClick={() =>
                                handleProductClick(item.product.id)
                              }
                              className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <img
                                src={
                                  item.product.capaUrl ||
                                  "https://via.placeholder.com/100x120"
                                }
                                alt={item.product.titulo}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div className="flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-slate-900">
                                  <h3>
                                    <button
                                      onClick={() =>
                                        handleProductClick(item.product.id)
                                      }
                                      className="hover:text-slate-700 text-left cursor-pointer"
                                    >
                                      {item.product.titulo}
                                    </button>
                                  </h3>
                                  <p className="ml-4">
                                    {(
                                      item.product.preco * item.quantity
                                    ).toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                  </p>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge
                                    variant={
                                      item.product.tipo === "ebook"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {item.product.tipo === "ebook" ? (
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
                                </div>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center border border-slate-300 rounded-lg">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.quantity - 1
                                      )
                                    }
                                    className="p-1 hover:bg-slate-100 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-3 font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={
                                      item.quantity >= item.product.estoque
                                    }
                                    className="p-1 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(item.product.id)
                                  }
                                  className="font-medium text-red-600 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {items.length > 0 && (
                        <div className="pt-2">
                          <button
                            onClick={clearCart}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Limpar carrinho
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="border-t px-4 py-6">
                    <div className="flex justify-between text-base font-medium text-slate-900">
                      <p>Subtotal</p>
                      <p>
                        {totalPrice.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Frete e impostos calculados no checkout.
                    </p>
                    <div className="mt-6 space-y-2">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800">
                        Finalizar Compra
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                      >
                        Continuar Comprando
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <ProductModal
        productId={selectedProductId}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
      />
    </>
  );
}
