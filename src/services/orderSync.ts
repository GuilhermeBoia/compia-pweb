import type { Order } from '@/types/checkout';

const PURCHASE_HISTORY_STORAGE_KEY = 'purchase_history';
const ORDER_MANAGEMENT_STORAGE_KEY = 'order_management';

export class OrderSyncService {
  private getPurchaseHistoryOrders(): Order[] {
    const stored = localStorage.getItem(PURCHASE_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private getOrderManagementOrders(): Order[] {
    const stored = localStorage.getItem(ORDER_MANAGEMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private savePurchaseHistoryOrders(orders: Order[]): void {
    localStorage.setItem(PURCHASE_HISTORY_STORAGE_KEY, JSON.stringify(orders));
  }

  private saveOrderManagementOrders(orders: Order[]): void {
    localStorage.setItem(ORDER_MANAGEMENT_STORAGE_KEY, JSON.stringify(orders));
  }

  async syncOrderStatus(orderId: string, status: Order['status'], updatedBy: 'admin' | 'system' = 'admin'): Promise<void> {
    console.log(`Syncing order status: ${orderId} -> ${status} (by ${updatedBy})`);
    
    try {
      // Update in order management (admin side)
      const managementOrders = this.getOrderManagementOrders();
      const managementIndex = managementOrders.findIndex(order => order.id === orderId);
      
      if (managementIndex >= 0) {
        managementOrders[managementIndex] = {
          ...managementOrders[managementIndex],
          status,
          updatedAt: new Date().toISOString()
        };
        this.saveOrderManagementOrders(managementOrders);
        console.log('Updated order management');
      }

      // Update in purchase history (customer side)
      const historyOrders = this.getPurchaseHistoryOrders();
      const historyIndex = historyOrders.findIndex(order => order.id === orderId);
      
      if (historyIndex >= 0) {
        historyOrders[historyIndex] = {
          ...historyOrders[historyIndex],
          status,
          updatedAt: new Date().toISOString()
        };
        this.savePurchaseHistoryOrders(historyOrders);
        console.log('Updated purchase history');
      }

      // If order exists in one but not the other, sync it
      if (managementIndex >= 0 && historyIndex === -1) {
        // Order exists in management but not in history - add to history
        historyOrders.unshift(managementOrders[managementIndex]);
        this.savePurchaseHistoryOrders(historyOrders);
        console.log('Added order to purchase history');
      } else if (historyIndex >= 0 && managementIndex === -1) {
        // Order exists in history but not in management - add to management
        managementOrders.unshift(historyOrders[historyIndex]);
        this.saveOrderManagementOrders(managementOrders);
        console.log('Added order to order management');
      }

      console.log('Order status sync completed successfully');
    } catch (error) {
      console.error('Error syncing order status:', error);
      throw error;
    }
  }

  async syncAllOrders(): Promise<void> {
    console.log('Syncing all orders between contexts...');
    
    try {
      const managementOrders = this.getOrderManagementOrders();
      const historyOrders = this.getPurchaseHistoryOrders();
      
      // Create a map of orders by ID for efficient lookup
      const historyMap = new Map(historyOrders.map(order => [order.id, order]));
      const managementMap = new Map(managementOrders.map(order => [order.id, order]));
      
      // Sync from management to history
      for (const order of managementOrders) {
        if (!historyMap.has(order.id)) {
          historyOrders.unshift(order);
          console.log(`Added order ${order.id} to purchase history`);
        } else {
          // Update existing order in history with latest status
          const historyIndex = historyOrders.findIndex(o => o.id === order.id);
          if (historyIndex >= 0) {
            historyOrders[historyIndex] = order;
            console.log(`Updated order ${order.id} in purchase history`);
          }
        }
      }
      
      // Sync from history to management
      for (const order of historyOrders) {
        if (!managementMap.has(order.id)) {
          managementOrders.unshift(order);
          console.log(`Added order ${order.id} to order management`);
        }
      }
      
      // Save updated orders
      this.savePurchaseHistoryOrders(historyOrders);
      this.saveOrderManagementOrders(managementOrders);
      
      console.log('All orders synced successfully');
    } catch (error) {
      console.error('Error syncing all orders:', error);
      throw error;
    }
  }

  async getOrderFromBothContexts(orderId: string): Promise<Order | null> {
    const managementOrders = this.getOrderManagementOrders();
    const historyOrders = this.getPurchaseHistoryOrders();
    
    const managementOrder = managementOrders.find(order => order.id === orderId);
    const historyOrder = historyOrders.find(order => order.id === orderId);
    
    // Return the most recent version
    if (managementOrder && historyOrder) {
      return new Date(managementOrder.updatedAt) > new Date(historyOrder.updatedAt) 
        ? managementOrder 
        : historyOrder;
    }
    
    return managementOrder || historyOrder || null;
  }
}

export const orderSyncService = new OrderSyncService();
