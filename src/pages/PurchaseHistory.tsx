import { useState, useEffect } from 'react';
import { usePurchaseHistory } from '@/contexts/PurchaseHistoryContext';
import { purchaseHistoryService } from '@/services/purchaseHistory';
import type { Order } from '@/types/checkout';

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function PurchaseHistory() {
  const { orders, isLoading } = usePurchaseHistory();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState({
    status: '' as Order['status'] | '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    loadStats();
    applyFilters();
  }, [orders, filters]);

  const loadStats = async () => {
    try {
      const statsData = await purchaseHistoryService.getStats();
      setStats({
        totalOrders: statsData.totalOrders,
        totalSpent: statsData.totalSpent,
        averageOrderValue: statsData.averageOrderValue
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await purchaseHistoryService.getOrders({
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        searchTerm: filters.searchTerm || undefined
      });
      setFilteredOrders(filtered);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Compras</h1>
        <p className="text-gray-600">Acompanhe todos os seus pedidos e compras realizadas</p>
      </div>


      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pedidos ({filteredOrders.length})
          </h2>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length === 0 
                ? 'Você ainda não fez nenhuma compra.' 
                : 'Tente ajustar os filtros para encontrar seus pedidos.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Pedido #{order.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Data:</strong> {formatDate(order.createdAt)}</p>
                        <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                      </div>
                      <div>
                        <p><strong>Cliente:</strong> {order.customer.nome}</p>
                        <p><strong>Email:</strong> {order.customer.email}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{item.productTitle} x {item.quantity}</span>
                            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
