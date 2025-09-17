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
