/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Customer, PaymentData, ShippingData, Order, CheckoutStep } from '@/types/checkout';
import { orderService, orderConfirmationService } from '@/services/order';
import { paymentService } from '@/services/payment';

interface CheckoutContextData {
  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Customer data
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  
  // Payment data
  payment: PaymentData | null;
  setPayment: (payment: PaymentData | null) => void;
  
  // Shipping data
  shipping: ShippingData | null;
  setShipping: (shipping: ShippingData | null) => void;
  
  // Order
  order: Order | null;
  setOrder: (order: Order | null) => void;
  
  // Steps
  steps: CheckoutStep[];
  isStepCompleted: (stepIndex: number) => boolean;
  canProceedToStep: (stepIndex: number) => boolean;
  
  // Actions
  resetCheckout: () => void;
  completeOrder: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextData>({} as CheckoutContextData);

const CHECKOUT_STORAGE_KEY = 'checkout_data';

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [shipping, setShipping] = useState<ShippingData | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const steps: CheckoutStep[] = [
    {
      id: 'customer',
      title: 'Dados Pessoais',
      description: 'Informações do cliente',
      completed: !!customer,
      current: currentStep === 0
    },
    {
      id: 'shipping',
      title: 'Entrega',
      description: 'Método e endereço de entrega',
      completed: !!shipping,
      current: currentStep === 1
    },
    {
      id: 'payment',
      title: 'Pagamento',
      description: 'Forma de pagamento',
      completed: !!payment,
      current: currentStep === 2
    },
    {
      id: 'confirmation',
      title: 'Confirmação',
      description: 'Revisar e finalizar',
      completed: !!order,
      current: currentStep === 3
    }
  ];

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setCustomer(data.customer || null);
      setPayment(data.payment || null);
      setShipping(data.shipping || null);
      setOrder(data.order || null);
      setCurrentStep(data.currentStep || 0);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      currentStep,
      customer,
      payment,
      shipping,
      order
    };
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  }, [currentStep, customer, payment, shipping, order]);

  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return !!customer;
      case 1:
        return !!shipping;
      case 2:
        return !!payment;
      case 3:
        return !!order;
      default:
        return false;
    }
  };

  const canProceedToStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return true;
      case 1:
        return isStepCompleted(0);
      case 2:
        return isStepCompleted(0) && isStepCompleted(1);
      case 3:
        return isStepCompleted(0) && isStepCompleted(1) && isStepCompleted(2);
      default:
        return false;
    }
  };

  const resetCheckout = () => {
    setCurrentStep(0);
    setCustomer(null);
    setPayment(null);
    setShipping(null);
    setOrder(null);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  };

  const completeOrder = async () => {
    if (!customer || !payment || !shipping) {
      throw new Error('Missing required checkout data');
    }

    try {
      // Create the order
      const newOrder = await orderService.createOrder({
        customer,
        items: [], // This would come from the cart context
        payment,
        shipping,
        total: 0, // This would be calculated from cart
        status: 'pending'
      });

      // Process payment
      const paymentResult = await paymentService.processPayment(newOrder, payment);
      
      if (paymentResult.success) {
        // Update order status
        await orderService.updateOrderStatus(newOrder.id, 'paid');
        
        // Process order confirmation
        const confirmation = await orderConfirmationService.processOrderConfirmation(newOrder);
        
        setOrder(newOrder);
        setCurrentStep(3);
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        customer,
        setCustomer,
        payment,
        setPayment,
        shipping,
        setShipping,
        order,
        setOrder,
        steps,
        isStepCompleted,
        canProceedToStep,
        resetCheckout,
        completeOrder
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
};
