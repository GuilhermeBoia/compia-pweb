export interface Address {
  id?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface Customer {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: Address;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'boleto';

export interface PaymentData {
  method: PaymentMethod;
  installments?: number;
  pixKey?: string;
  pixKeyType?: 'email' | 'phone' | 'cpf' | 'random';
}

export type ShippingMethod = 'correios' | 'pickup' | 'digital';

export interface ShippingData {
  method: ShippingMethod;
  address?: Address;
  pickupLocation?: string;
  estimatedDays?: number;
  cost: number;
}

export interface Order {
  id: string;
  customer: Customer;
  items: Array<{
    productId: string;
    productTitle: string;
    quantity: number;
    price: number;
    type: 'physical' | 'ebook';
  }>;
  payment: PaymentData;
  shipping: ShippingData;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}
