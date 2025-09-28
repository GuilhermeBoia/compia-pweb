import type { Order } from '@/types/checkout';

const ORDER_MANAGEMENT_STORAGE_KEY = 'order_management';

export interface OrderManagementFilters {
  status?: Order['status'];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  customerEmail?: string;
}

export interface OrderManagementStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<Order['status'], number>;
  averageOrderValue: number;
  pendingOrders: number;
  ordersNeedingAction: number;
  recentOrders: Order[];
}

export interface OrderStatusUpdate {
  orderId: string;
  status: Order['status'];
  notes?: string;
  updatedBy?: string;
  updatedAt: string;
}

export class OrderManagementService {
  private getStoredOrders(): Order[] {
    const stored = localStorage.getItem(ORDER_MANAGEMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDER_MANAGEMENT_STORAGE_KEY, JSON.stringify(orders));
  }

  async getOrders(filters?: OrderManagementFilters): Promise<Order[]> {
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

      if (filters.customerEmail) {
        orders = orders.filter(order => 
          order.customer.email.toLowerCase().includes(filters.customerEmail!.toLowerCase())
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

  async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<void> {
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

  async getPendingOrders(): Promise<Order[]> {
    const orders = this.getStoredOrders();
    return orders.filter(order => 
      order.status === 'pending' || order.status === 'paid'
    );
  }

  async getOrdersNeedingAction(): Promise<Order[]> {
    const orders = this.getStoredOrders();
    return orders.filter(order => 
      order.status === 'paid' || order.status === 'shipped'
    );
  }

  async getStats(): Promise<OrderManagementStats> {
    const orders = this.getStoredOrders();
    
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<Order['status'], number>);
    
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'paid'
    ).length;
    
    const ordersNeedingAction = orders.filter(order => 
      order.status === 'paid' || order.status === 'shipped'
    ).length;

    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      averageOrderValue,
      pendingOrders,
      ordersNeedingAction,
      recentOrders
    };
  }

  async getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
    const orders = this.getStoredOrders();
    return orders.filter(order => 
      order.customer.email.toLowerCase() === customerEmail.toLowerCase()
    );
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const orders = this.getStoredOrders();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }

  async clearAllOrders(): Promise<void> {
    localStorage.removeItem(ORDER_MANAGEMENT_STORAGE_KEY);
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

  async bulkUpdateStatus(orderIds: string[], status: Order['status']): Promise<void> {
    const orders = this.getStoredOrders();
    
    orderIds.forEach(orderId => {
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex >= 0) {
        orders[orderIndex] = {
          ...orders[orderIndex],
          status,
          updatedAt: new Date().toISOString()
        };
      }
    });
    
    this.saveOrders(orders);
  }
}

export const orderManagementService = new OrderManagementService();
