export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export const users: User[] = [
  { id: 1, name: "Cliente Compia", email: "cliente@compia.com", role: "customer" },
  { id: 2, name: "Admin Compia", email: "admin@compia.com", role: "admin" },
];
