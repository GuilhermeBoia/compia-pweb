import { useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { orderService } from '@/services/order';
import { paymentService } from '@/services/payment';
import { orderConfirmationService } from '@/services/order';
import type { Order } from '@/types/checkout';

export function useCheckoutIntegrationSimple() {
  const { items, clearCart } = useCart();
  const { customer, payment, shipping, setOrder, setCurrentStep } = useCheckout();

  const completeOrderWithIntegration = useCallback(async () => {
    console.log('Starting order completion...', { customer, payment, shipping, items });
    
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
      const total = items.reduce((sum, item) => sum + (item.product.preco * item.quantity), 0);
      console.log('Calculated total:', total);
      
      // Create order items from cart
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productTitle: item.product.titulo,
        quantity: item.quantity,
        price: item.product.preco,
        type: item.product.tipo === 'fisico' ? 'physical' as const : 'ebook' as const
      }));
      console.log('Order items:', orderItems);

      // Create the order
      console.log('Creating order...');
      const newOrder: Order = await orderService.createOrder({
        customer,
        items: orderItems,
        payment,
        shipping,
        total,
        status: 'pending'
      });
      console.log('Order created:', newOrder);

      // Process payment
      console.log('Processing payment...');
      const paymentResult = await paymentService.processPayment(newOrder, payment);
      console.log('Payment result:', paymentResult);
      
      if (paymentResult.success) {
        // Update order status to paid
        const paidOrder: Order = {
          ...newOrder,
          status: 'paid',
          updatedAt: new Date().toISOString()
        };
        console.log('Order updated to paid:', paidOrder);

        // Process order confirmation
        console.log('Processing order confirmation...');
        await orderConfirmationService.processOrderConfirmation(paidOrder);
        
        // Clear cart after successful order
        console.log('Clearing cart...');
        clearCart();
        
        // Update checkout state
        console.log('Updating checkout state...');
        setOrder(paidOrder);
        setCurrentStep(3);
        
        console.log('Order completed successfully!');
        return paidOrder;
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }, [customer, payment, shipping, items, clearCart, setOrder, setCurrentStep]);

  return {
    completeOrderWithIntegration
  };
}
