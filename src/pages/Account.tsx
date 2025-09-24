// src/pages/Account.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { Navigate } from "react-router-dom";

// Nossos componentes reutilizáveis
import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";

export default function Account() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();

  // --- 1. Rota Protegida ---
  // Se não houver usuário logado, redireciona para a página de login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Garante que um admin não acesse a página de conta do cliente por engano
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // --- 2. Filtragem dos Pedidos ---
  // Filtra a lista de todos os pedidos para pegar apenas os do usuário atual.
  const userOrders = orders.filter((order) => order.userId === user.id);

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Minha Conta</h1>
          <p className="text-muted-foreground">
            Olá, {user.name}! Veja seus pedidos abaixo.
          </p>
        </div>
        <Button variant="destructive" onClick={logout}>
          Sair
        </Button>
      </header>

      <main>
        <h2 className="text-2xl font-semibold mb-6">Meus Pedidos</h2>

        {/* --- 3. Exibição dos Pedidos --- */}
        {userOrders.length > 0 ? (
          // Se houver pedidos, mapeia e renderiza um OrderCard para cada um
          userOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          // Se não houver pedidos, mostra uma mensagem amigável
          <div className="text-center py-12 px-6 bg-slate-50 rounded-lg">
            <p className="text-muted-foreground">
              Você ainda não fez nenhum pedido.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
