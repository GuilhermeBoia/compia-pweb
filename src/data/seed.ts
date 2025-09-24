export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export const users: User[] = [
  { id: 1, name: "Ana Cliente", email: "ana@cliente.com", role: "customer" },
  { id: 2, name: "Bruno Admin", email: "bruno@admin.com", role: "admin" },
];

export type OrderStatus = "Pendente" | "Pago" | "Enviado" | "Entregue" | "Cancelado";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: number; // Para vincular o pedido a um usuário
  customerName: string;
  date: string;
  status: OrderStatus;
  shipping: number;
  items: OrderItem[];
  total: number;
}

// Nossa lista de pedidos "mockados"
export const orders: Order[] = [
  {
    id: "PED-001",
    userId: 1, // Pertence à "Ana Cliente"
    customerName: "Ana Cliente",
    date: "2025-09-15",
    status: "Entregue",
    shipping: 15.50,
    items: [{ id: 101, name: "Livro de React Avançado", quantity: 1, price: 79.90 }],
    total: 95.40,
  },
  {
    id: "PED-002",
    userId: 1, // Pertence à "Ana Cliente"
    customerName: "Ana Cliente",
    date: "2025-09-16",
    status: "Enviado",
    shipping: 12.00,
    items: [{ id: 102, name: "Introdução à Inteligência Artificial", quantity: 2, price: 59.90 }],
    total: 131.80,
  },
  {
    id: "PED-003",
    userId: 2, // Pertence ao "Bruno Admin" para teste
    customerName: "Bruno Admin",
    date: "2025-09-17",
    status: "Pago",
    shipping: 0, // E-book, sem frete [cite: 7]
    items: [{ id: 103, name: "E-book: Segurança em Blockchain", quantity: 1, price: 45.00 }],
    total: 45.00,
  },
   {
    id: "PED-004",
    userId: 1, // Pertence à "Ana Cliente"
    customerName: "Ana Cliente",
    date: "2025-09-17",
    status: "Pendente",
    shipping: 25.00,
    items: [{ id: 104, name: "Arquitetura de Software Moderna", quantity: 1, price: 110.00 }],
    total: 135.00,
  },
];