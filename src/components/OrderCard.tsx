import type { Order, OrderStatus } from "@/data/seed";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";

// Componentes shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";

// Define a interface de props que o componente espera receber
interface OrderCardProps {
  order: Order;
}

// Mapeamento de status para cores do Badge
const statusVariantMap: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Pendente: "default", // Fundo cinza escuro
  Pago: "secondary", // Fundo cinza claro
  Enviado: "outline", // Borda (azul)
  Entregue: "destructive", // Fundo vermelho (usando como exemplo, pode ser alterado)
  Cancelado: "destructive",
};

export default function OrderCard({ order }: OrderCardProps) {
  const { user } = useAuth(); // Pega o usuário logado para verificar se é admin
  const { updateOrderStatus } = useOrders(); // Pega a função para atualizar o status

  // Função chamada quando o admin muda o valor do <Select>
  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
  };

  return (
    <Card className="mb-4 shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Pedido #{order.id}</CardTitle>
            <CardDescription>Realizado em: {order.date}</CardDescription>
            {/* Mostra o nome do cliente APENAS se o usuário for admin */}
            {user?.role === "admin" && (
              <p className="text-sm text-muted-foreground mt-1">
                Cliente: {order.customerName}
              </p>
            )}
          </div>
          <Badge variant={statusVariantMap[order.status] || "default"}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">Itens:</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.name} (R$ {item.price.toFixed(2)} cada)
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between items-end bg-slate-50 p-4">
        <div>
          <p className="text-sm">Frete: R$ {order.shipping.toFixed(2)}</p>
          <p className="text-lg font-bold">
            Total: R$ {order.total.toFixed(2)}
          </p>
        </div>

        {/* Mostra o seletor de status APENAS se o usuário for admin */}
        {user?.role === "admin" && (
          <div className="w-48">
            <Label className="text-xs">Alterar Status</Label>
            <Select
              onValueChange={handleStatusChange}
              defaultValue={order.status}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
