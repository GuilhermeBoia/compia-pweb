import type { Order } from '@/types/checkout';

const PURCHASE_HISTORY_STORAGE_KEY = 'purchase_history';

export interface PurchaseHistoryFilters {
  status?: Order['status'];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface PurchaseHistoryStats {
  totalOrders: number;
  totalSpent: number;
  ordersByStatus: Record<Order['status'], number>;
  averageOrderValue: number;
  lastOrderDate?: string;
}

export class PurchaseHistoryService {
  private getStoredOrders(): Order[] {
    const stored = localStorage.getItem(PURCHASE_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(PURCHASE_HISTORY_STORAGE_KEY, JSON.stringify(orders));
  }

  async getOrders(filters?: PurchaseHistoryFilters): Promise<Order[]> {
    let orders = this.getStoredOrders();

    if (filters) {
      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }

      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        orders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate <= end;
        });
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        orders = orders.filter(order => 
          order.id.toLowerCase().includes(searchLower) ||
          order.customer.nome.toLowerCase().includes(searchLower) ||
          order.customer.email.toLowerCase().includes(searchLower) ||
          order.items.some(item => 
            item.productTitle.toLowerCase().includes(searchLower)
          )
        );
      }
    }

    // Sort by creation date (newest first)
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    const orders = this.getStoredOrders();
    return orders.find(order => order.id === orderId);
  }

  async addOrder(order: Order): Promise<void> {
    const orders = this.getStoredOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      // Update existing order
      orders[existingIndex] = order;
    } else {
      // Add new order
      orders.unshift(order);
    }
    
    this.saveOrders(orders);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex >= 0) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      this.saveOrders(orders);
    }
  }

  async getStats(): Promise<PurchaseHistoryStats> {
    const orders = this.getStoredOrders();
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<Order['status'], number>);
    
    const lastOrderDate = orders.length > 0 
      ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : undefined;

    return {
      totalOrders,
      totalSpent,
      ordersByStatus,
      averageOrderValue,
      lastOrderDate
    };
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(PURCHASE_HISTORY_STORAGE_KEY);
  }

  async exportOrders(): Promise<string> {
    const orders = this.getStoredOrders();
    return JSON.stringify(orders, null, 2);
  }

  async importOrders(ordersJson: string): Promise<void> {
    try {
      const orders = JSON.parse(ordersJson);
      if (Array.isArray(orders)) {
        this.saveOrders(orders);
      } else {
        throw new Error('Invalid orders format');
      }
    } catch (error) {
      throw new Error('Failed to import orders: Invalid JSON format');
    }
  }
}

export const purchaseHistoryService = new PurchaseHistoryService();
