/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order } from '@/types/checkout';

interface PurchaseHistoryContextData {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByDateRange: (startDate: string, endDate: string) => Order[];
  clearHistory: () => void;
  isLoading: boolean;
}

const PurchaseHistoryContext = createContext<PurchaseHistoryContextData>({} as PurchaseHistoryContextData);

const PURCHASE_HISTORY_STORAGE_KEY = 'purchase_history';

export function PurchaseHistoryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem(PURCHASE_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem(PURCHASE_HISTORY_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders(currentOrders => {
      // Check if order already exists (by ID)
      const existingIndex = currentOrders.findIndex(o => o.id === order.id);
      
      if (existingIndex >= 0) {
        // Update existing order
        const updatedOrders = [...currentOrders];
        updatedOrders[existingIndex] = order;
        return updatedOrders;
      } else {
        // Add new order
        return [order, ...currentOrders];
      }
    });
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };

  const clearHistory = () => {
    setOrders([]);
    localStorage.removeItem(PURCHASE_HISTORY_STORAGE_KEY);
  };

  return (
    <PurchaseHistoryContext.Provider
      value={{
        orders,
        addOrder,
        getOrderById,
        getOrdersByStatus,
        getOrdersByDateRange,
        clearHistory,
        isLoading
      }}
    >
      {children}
    </PurchaseHistoryContext.Provider>
  );
}

export const usePurchaseHistory = () => {
  const context = useContext(PurchaseHistoryContext);
  if (!context) {
    throw new Error('usePurchaseHistory must be used within PurchaseHistoryProvider');
  }
  return context;
};
