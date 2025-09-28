import { useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { usePurchaseHistory } from '@/contexts/PurchaseHistoryContext';
import { useOrderManagement } from '@/contexts/OrderManagementContext';
import { api } from '@/services/api';
import type { Order } from '@/types/checkout';

export function useCheckoutIntegrationTest() {
  const { items, clearCart } = useCart();
  const { customer, payment, shipping, setOrder, setCurrentStep, resetCheckout } = useCheckout();
  const { addOrder: addToPurchaseHistory } = usePurchaseHistory();
  const { addOrder: addToOrderManagement } = useOrderManagement();

  const completeOrderWithIntegration = useCallback(async () => {
    console.log('Starting order completion (TEST MODE)...', { customer, payment, shipping, items });
    
    if (!customer || !payment || !shipping) {
      const missing = [];
      if (!customer) missing.push('customer');
      if (!payment) missing.push('payment');
      if (!shipping) missing.push('shipping');
      throw new Error(`Missing required checkout data: ${missing.join(', ')}`);
    }

    if (!items || items.length === 0) {
      throw new Error('Cart is empty');
    }

    try {
      // Calculate total from cart items
      const subtotal = items.reduce((sum, item) => sum + (item.product.preco * item.quantity), 0);
      const shippingCost = shipping?.cost || 0;
      const total = subtotal + shippingCost;
      console.log('Calculated total:', { subtotal, shippingCost, total });
      
      // Create order items from cart
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productTitle: item.product.titulo,
        quantity: item.quantity,
        price: item.product.preco,
        type: item.product.tipo === 'fisico' ? 'physical' as const : 'ebook' as const
      }));
      console.log('Order items:', orderItems);

      // Create a simple order without external services
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        customer,
        items: orderItems,
        payment,
        shipping,
        total,
        status: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Order created (TEST MODE):', newOrder);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to both contexts
      console.log('Saving to purchase history...');
      try {
        addToPurchaseHistory(newOrder);
        console.log('Saved to purchase history successfully');
      } catch (error) {
        console.error('Error saving to purchase history:', error);
      }
      
      console.log('Saving to order management...');
      try {
        addToOrderManagement(newOrder);
        console.log('Saved to order management successfully');
      } catch (error) {
        console.error('Error saving to order management:', error);
      }

      // Update stock for each product
      console.log('Updating stock...');
      for (const item of items) {
        try {
          await api.products.updateStock(item.product.id, -item.quantity);
          console.log(`Stock updated for product ${item.product.id}: -${item.quantity}`);
        } catch (error) {
          console.error(`Error updating stock for product ${item.product.id}:`, error);
        }
      }
      console.log('Stock update completed');

      // Clear cart after successful order
      console.log('Clearing cart...');
      clearCart();
      
      // Reset checkout data for new purchase
      console.log('Resetting checkout data...');
      resetCheckout();
      
      // Update checkout state
      console.log('Updating checkout state...');
      setOrder(newOrder);
      setCurrentStep(3);
      
      console.log('Order completed successfully (TEST MODE)!');
      return newOrder;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }, [customer, payment, shipping, items, addToPurchaseHistory, addToOrderManagement, clearCart, setOrder, setCurrentStep, resetCheckout]);

  return {
    completeOrderWithIntegration
  };
}
