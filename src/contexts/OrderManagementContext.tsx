/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order } from '@/types/checkout';

interface OrderManagementContextData {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByDateRange: (startDate: string, endDate: string) => Order[];
  getPendingOrders: () => Order[];
  getOrdersNeedingAction: () => Order[];
  clearAllOrders: () => void;
  isLoading: boolean;
}

const OrderManagementContext = createContext<OrderManagementContextData>({} as OrderManagementContextData);

const ORDER_MANAGEMENT_STORAGE_KEY = 'order_management';

export function OrderManagementProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem(ORDER_MANAGEMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem(ORDER_MANAGEMENT_STORAGE_KEY, JSON.stringify(orders));
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

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(currentOrders => 
      currentOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status, 
              updatedAt: new Date().toISOString() 
            } 
          : order
      )
    );
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

  const getPendingOrders = () => {
    return orders.filter(order => 
      order.status === 'pending' || order.status === 'paid'
    );
  };

  const getOrdersNeedingAction = () => {
    return orders.filter(order => 
      order.status === 'paid' || order.status === 'shipped'
    );
  };

  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem(ORDER_MANAGEMENT_STORAGE_KEY);
  };

  return (
    <OrderManagementContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrderById,
        getOrdersByStatus,
        getOrdersByDateRange,
        getPendingOrders,
        getOrdersNeedingAction,
        clearAllOrders,
        isLoading
      }}
    >
      {children}
    </OrderManagementContext.Provider>
  );
}

export const useOrderManagement = () => {
  const context = useContext(OrderManagementContext);
  if (!context) {
    throw new Error('useOrderManagement must be used within OrderManagementProvider');
  }
  return context;
};
