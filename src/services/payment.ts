import type { PaymentData, Order } from '@/types/checkout';
import QRCode from 'qrcode';

export interface PaymentGateway {
  name: string;
  processPayment: (order: Order, paymentData: PaymentData) => Promise<PaymentResult>;
  createPixPayment: (order: Order) => Promise<PixPaymentResult>;
  createBoletoPayment: (order: Order) => Promise<BoletoPaymentResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  redirectUrl?: string;
}

export interface PixPaymentResult {
  success: boolean;
  qrCode?: string;
  qrCodeImage?: string;
  pixKey?: string;
  expiresAt?: string;
  message?: string;
}

export interface BoletoPaymentResult {
  success: boolean;
  boletoUrl?: string;
  boletoCode?: string;
  expiresAt?: string;
  message?: string;
}

// Mock implementation for development
class MockPaymentGateway implements PaymentGateway {
  name = 'Mock Gateway';

  async processPayment(_order: Order, paymentData: PaymentData): Promise<PaymentResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate different outcomes based on payment method
    if (paymentData.method === 'credit_card') {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        status: 'approved',
        message: 'Pagamento aprovado com sucesso!'
      };
    }

    if (paymentData.method === 'debit_card') {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        status: 'approved',
        message: 'Pagamento aprovado com sucesso!'
      };
    }

    return {
      success: false,
      status: 'rejected',
      message: 'Método de pagamento não suportado'
    };
  }

  async createPixPayment(order: Order): Promise<PixPaymentResult> {
    console.log('Creating PIX payment for order:', order);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a random PIX key for demonstration
      const pixKey = this.generateRandomPixKey();
      console.log('Generated PIX key:', pixKey);
      
      const pixCode = this.generatePixCode(order, pixKey);
      console.log('Generated PIX code:', pixCode);
      
      // Generate QR Code image
      console.log('Generating QR Code image...');
      const qrCodeImage = await QRCode.toDataURL(pixCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR Code image generated successfully');

      const result = {
        success: true,
        qrCode: pixCode,
        qrCodeImage,
        pixKey,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        message: 'PIX gerado com sucesso!'
      };
      
      console.log('PIX payment result:', result);
      return result;
    } catch (error) {
      console.error('Error creating PIX payment:', error);
      return {
        success: false,
        message: 'Erro ao gerar PIX'
      };
    }
  }

  private generateRandomPixKey(): string {
    // Generate a random PIX key (CPF format for demo)
    const randomNumbers = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
    return `${randomNumbers.slice(0, 3)}.${randomNumbers.slice(3, 6)}.${randomNumbers.slice(6, 9)}-${randomNumbers.slice(9, 11)}`;
  }

  private generatePixCode(order: Order, _pixKey: string): string {
    // Generate a simplified PIX code for demonstration
    // In a real implementation, this would follow the PIX standard format
    const amount = order.total.toFixed(2);
    const merchantName = 'Compia PWeb';
    const orderId = order.id;
    
    // Simplified PIX code structure
    return `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540.00${amount}5802BR5913${merchantName}6008BRASILIA62070503***6304${orderId}`;
  }

  async createBoletoPayment(order: Order): Promise<BoletoPaymentResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      boletoUrl: `https://exemplo.com/boleto/${order.id}`,
      boletoCode: '23791.12345.67890.123456.789012.345678.12345678901234',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      message: 'Boleto gerado com sucesso!'
    };
  }
}

// Mercado Pago integration (placeholder)
class MercadoPagoGateway implements PaymentGateway {
  name = 'Mercado Pago';

  async processPayment(_order: Order, _paymentData: PaymentData): Promise<PaymentResult> {
    // TODO: Implement Mercado Pago integration
    throw new Error('Mercado Pago integration not implemented yet');
  }

  async createPixPayment(_order: Order): Promise<PixPaymentResult> {
    // TODO: Implement Mercado Pago PIX
    throw new Error('Mercado Pago PIX not implemented yet');
  }

  async createBoletoPayment(_order: Order): Promise<BoletoPaymentResult> {
    // TODO: Implement Mercado Pago Boleto
    throw new Error('Mercado Pago Boleto not implemented yet');
  }
}

// Stripe integration (placeholder)
class StripeGateway implements PaymentGateway {
  name = 'Stripe';

  async processPayment(_order: Order, _paymentData: PaymentData): Promise<PaymentResult> {
    // TODO: Implement Stripe integration
    throw new Error('Stripe integration not implemented yet');
  }

  async createPixPayment(_order: Order): Promise<PixPaymentResult> {
    // TODO: Implement Stripe PIX (if supported)
    throw new Error('Stripe PIX not implemented yet');
  }

  async createBoletoPayment(_order: Order): Promise<BoletoPaymentResult> {
    // TODO: Implement Stripe Boleto (if supported)
    throw new Error('Stripe Boleto not implemented yet');
  }
}

// Payment service factory
export class PaymentService {
  private gateway: PaymentGateway;

  constructor(gateway: PaymentGateway) {
    this.gateway = gateway;
  }

  async processPayment(order: Order, paymentData: PaymentData): Promise<PaymentResult> {
    return this.gateway.processPayment(order, paymentData);
  }

  async createPixPayment(order: Order): Promise<PixPaymentResult> {
    return this.gateway.createPixPayment(order);
  }

  async createBoletoPayment(order: Order): Promise<BoletoPaymentResult> {
    return this.gateway.createBoletoPayment(order);
  }
}

// Export configured payment service
export const paymentService = new PaymentService(new MockPaymentGateway());

// Export individual gateways for configuration
export { MockPaymentGateway, MercadoPagoGateway, StripeGateway };
