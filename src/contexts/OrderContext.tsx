// src/contexts/OrderContext.tsx
import { createContext, useState, useContext, type ReactNode } from "react";
import { orders as initialOrders, type Order, type OrderStatus } from "../data/seed";

// Define o que nosso contexto irá fornecer para os componentes
interface OrderContextType {
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa o estado com a lista de pedidos do nosso arquivo seed
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Função para atualizar o status de um pedido específico
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        // Se o ID do pedido corresponder, retorna um novo objeto com o status atualizado
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
